"""
Tests for qa_agent.py — validate_deal() and score_authenticity().
All tests are pure (no DB, no LLM calls).
"""
import json
import sys
import os
from datetime import datetime, timezone, timedelta
from unittest.mock import patch

# Add the agents package to sys.path so imports resolve
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from qa_agent import validate_deal, score_authenticity, MIN_AUTHENTICITY_SCORE

# ---------------------------------------------------------------------------
# validate_deal
# ---------------------------------------------------------------------------

def _valid_deal(**overrides):
    base = {
        'id': 'deal-1',
        'title': 'Samsung 65" 4K QLED TV',
        'price_current': 799.99,
        'price_was': 1199.99,
        'discount_pct': 33,
        'url': 'https://example.com/deal',
        'affiliate_url': 'https://awin.com/cread.php?abc=123',
        'category': 'Electronics',
        'created_at': datetime.now(timezone.utc).isoformat(),
    }
    base.update(overrides)
    return base


class TestValidateDeal:
    def test_valid_deal_passes(self):
        ok, reason = validate_deal(_valid_deal())
        assert ok is True
        assert reason == ''

    def test_short_title_fails(self):
        ok, reason = validate_deal(_valid_deal(title='TV'))
        assert ok is False
        assert 'title' in reason

    def test_empty_title_fails(self):
        ok, reason = validate_deal(_valid_deal(title=''))
        assert ok is False

    def test_zero_price_fails(self):
        ok, reason = validate_deal(_valid_deal(price_current=0))
        assert ok is False
        assert 'price' in reason

    def test_negative_price_fails(self):
        ok, reason = validate_deal(_valid_deal(price_current=-5))
        assert ok is False

    def test_invalid_url_fails(self):
        ok, reason = validate_deal(_valid_deal(url='not-a-url'))
        assert ok is False
        assert 'url' in reason

    def test_missing_affiliate_url_fails(self):
        ok, reason = validate_deal(_valid_deal(affiliate_url='ftp://invalid'))
        assert ok is False
        assert 'affiliate' in reason

    def test_discount_mismatch_fails(self):
        # stated 80% but actual is 33%
        ok, reason = validate_deal(_valid_deal(discount_pct=80))
        assert ok is False
        assert 'discount mismatch' in reason

    def test_discount_within_tolerance_passes(self):
        # 33.33% rounds to 33 — within 5% tolerance
        ok, _ = validate_deal(_valid_deal(discount_pct=33))
        assert ok is True

    def test_stale_deal_rejected(self):
        stale_date = (datetime.now(timezone.utc) - timedelta(days=8)).isoformat()
        ok, reason = validate_deal(_valid_deal(created_at=stale_date))
        assert ok is False
        assert 'stale' in reason

    def test_no_was_price_skips_discount_check(self):
        ok, _ = validate_deal(_valid_deal(price_was=None, discount_pct=None))
        assert ok is True

    def test_missing_created_at_does_not_crash(self):
        ok, _ = validate_deal(_valid_deal(created_at=None))
        assert ok is True


# ---------------------------------------------------------------------------
# score_authenticity
# ---------------------------------------------------------------------------

class TestScoreAuthenticity:
    def test_no_was_price_returns_default(self):
        deal = _valid_deal(price_was=None, discount_pct=None)
        score, reason = score_authenticity(deal)
        assert score == 75
        assert 'no was-price' in reason

    def test_llm_score_clamped_to_0_100(self):
        deal = _valid_deal()
        with patch('qa_agent.complete', return_value='{"score": 150, "reason": "too good"}'):
            score, _ = score_authenticity(deal)
        assert score == 100

    def test_llm_score_below_zero_clamped(self):
        deal = _valid_deal()
        with patch('qa_agent.complete', return_value='{"score": -10, "reason": "fake"}'):
            score, _ = score_authenticity(deal)
        assert score == 0

    def test_invalid_json_returns_fallback(self):
        deal = _valid_deal()
        with patch('qa_agent.complete', return_value='not json at all'):
            score, reason = score_authenticity(deal)
        assert score == 50
        assert 'could not parse' in reason

    def test_llm_exception_returns_fallback(self):
        deal = _valid_deal()
        with patch('qa_agent.complete', side_effect=RuntimeError('API down')):
            score, reason = score_authenticity(deal)
        assert score == 50

    def test_high_score_would_approve(self):
        deal = _valid_deal()
        with patch('qa_agent.complete', return_value='{"score": 85, "reason": "genuine discount"}'):
            score, _ = score_authenticity(deal)
        assert score >= MIN_AUTHENTICITY_SCORE

    def test_low_score_would_reject(self):
        deal = _valid_deal()
        with patch('qa_agent.complete', return_value='{"score": 20, "reason": "inflated was-price"}'):
            score, _ = score_authenticity(deal)
        assert score < MIN_AUTHENTICITY_SCORE


# ---------------------------------------------------------------------------
# run() — end-to-end with mocked Supabase + LLM
# ---------------------------------------------------------------------------

from qa_agent import run  # noqa: E402


class _MockSupabaseChain:
    """Chainable mock that records calls. Mimics supabase-py's fluent API."""
    def __init__(self, deals=None):
        self._deals = deals or []
        self.updates = []
        self._current_update = None

    def table(self, _name):
        return self

    def select(self, _cols):
        return self

    def eq(self, key, value):
        if self._current_update is not None:
            self._current_update['where'] = (key, value)
            self.updates.append(self._current_update)
            self._current_update = None
        return self

    def limit(self, _n):
        return self

    def update(self, payload):
        self._current_update = {'payload': payload}
        return self

    def execute(self):
        class _Result: pass
        r = _Result()
        r.data = self._deals
        return r


class TestRun:
    def test_no_pending_deals_logs_and_exits(self):
        mock_db = _MockSupabaseChain(deals=[])
        with patch('qa_agent.get_client', return_value=mock_db), \
             patch('qa_agent.log') as mock_log:
            run(dry_run=False)
        mock_log.assert_called_once()
        assert mock_log.call_args[0][1] == 'success'

    def test_invalid_deal_marked_rejected(self):
        bad_deal = _valid_deal(title='X', id='bad-1')  # title too short
        mock_db = _MockSupabaseChain(deals=[bad_deal])
        with patch('qa_agent.get_client', return_value=mock_db), \
             patch('qa_agent.log'):
            run(dry_run=False)
        assert any(u['payload'].get('status') == 'rejected' for u in mock_db.updates)

    def test_dry_run_writes_nothing(self):
        bad_deal = _valid_deal(title='X', id='bad-1')
        mock_db = _MockSupabaseChain(deals=[bad_deal])
        with patch('qa_agent.get_client', return_value=mock_db), \
             patch('qa_agent.log'):
            run(dry_run=True)
        assert mock_db.updates == []

    def test_valid_deal_with_high_score_approved(self):
        good_deal = _valid_deal(id='good-1')
        mock_db = _MockSupabaseChain(deals=[good_deal])
        with patch('qa_agent.get_client', return_value=mock_db), \
             patch('qa_agent.complete', return_value='{"score": 90, "reason": "real"}'), \
             patch('qa_agent.log'):
            run(dry_run=False)
        approvals = [u for u in mock_db.updates if u['payload'].get('status') == 'approved']
        assert len(approvals) == 1
        assert approvals[0]['payload']['authenticity_score'] == 90

    def test_valid_deal_with_low_score_rejected(self):
        good_deal = _valid_deal(id='low-1')
        mock_db = _MockSupabaseChain(deals=[good_deal])
        with patch('qa_agent.get_client', return_value=mock_db), \
             patch('qa_agent.complete', return_value='{"score": 20, "reason": "fake"}'), \
             patch('qa_agent.log'):
            run(dry_run=False)
        rejections = [u for u in mock_db.updates if u['payload'].get('status') == 'rejected']
        assert len(rejections) == 1

    def test_exception_during_deal_does_not_kill_batch(self):
        d1 = _valid_deal(id='ok-1')
        d2 = _valid_deal(id='ok-2')
        mock_db = _MockSupabaseChain(deals=[d1, d2])
        # First call raises, second succeeds
        with patch('qa_agent.get_client', return_value=mock_db), \
             patch('qa_agent.complete', side_effect=[RuntimeError('boom'), '{"score": 85, "reason": "ok"}']), \
             patch('qa_agent.log') as mock_log:
            run(dry_run=False)
        # Should still log — status 'partial' because errors > 0
        mock_log.assert_called_once()
        assert mock_log.call_args[0][1] in ('success', 'partial')
