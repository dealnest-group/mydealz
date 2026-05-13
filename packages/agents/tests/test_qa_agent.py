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
