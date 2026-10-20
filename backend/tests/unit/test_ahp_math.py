"""
Unit tests for AHP Matrix Math and Consistency Ratio (Proposal Section 3.3, 3.4; Table 2.1)
"""
import numpy as np
import pytest
from app.ahp.matrix import calculate_ahp_weights, aggregate_expert_matrices


def test_ahp_n1_special_case():
    m = np.array([[1.0]])
    weights, lambda_max, ci, cr, is_consistent = calculate_ahp_weights(m)
    assert len(weights) == 1
    assert weights[0] == 1.0
    assert cr == 0.0
    assert is_consistent is True


def test_ahp_n2_special_case():
    # 2x2 comparison matrix: A is 3 times more important than B
    m = np.array([
        [1.0, 3.0],
        [1.0/3.0, 1.0]
    ])
    weights, lambda_max, ci, cr, is_consistent = calculate_ahp_weights(m)
    assert len(weights) == 2
    assert np.isclose(weights[0], 0.75, atol=1e-3)
    assert np.isclose(weights[1], 0.25, atol=1e-3)
    assert cr == 0.0
    assert is_consistent is True


def test_ahp_consistent_3x3_matrix():
    # Perfectly consistent 3x3 matrix: A vs B is 2, B vs C is 3 -> A vs C must be 6
    m = np.array([
        [1.0, 2.0, 6.0],
        [0.5, 1.0, 3.0],
        [1.0/6.0, 1.0/3.0, 1.0]
    ])
    weights, lambda_max, ci, cr, is_consistent = calculate_ahp_weights(m)
    assert np.isclose(np.sum(weights), 1.0, atol=1e-4)
    assert np.isclose(lambda_max, 3.0, atol=1e-3)
    assert ci < 0.01
    assert cr < 0.05
    assert is_consistent is True


def test_ahp_inconsistent_matrix_flags_cr():
    # Intentionally inconsistent 3x3 matrix: A > B (5), B > C (5), but C > A (5)
    m = np.array([
        [1.0, 5.0, 1.0/5.0],
        [1.0/5.0, 1.0, 5.0],
        [5.0, 1.0/5.0, 1.0]
    ])
    weights, lambda_max, ci, cr, is_consistent = calculate_ahp_weights(m)
    assert cr > 0.10
    assert is_consistent is False


def test_ahp_expert_aggregation():
    m1 = np.array([
        [1.0, 2.0],
        [0.5, 1.0]
    ])
    m2 = np.array([
        [1.0, 4.0],
        [0.25, 1.0]
    ])
    agg = aggregate_expert_matrices([m1, m2])
    # Geometric mean of 2 and 4 is sqrt(8) ~ 2.828
    assert np.isclose(agg[0, 1], np.sqrt(8.0), atol=1e-3)
    assert np.isclose(agg[1, 0], 1.0 / np.sqrt(8.0), atol=1e-3)
