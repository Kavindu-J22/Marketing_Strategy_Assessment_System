"""
Analytical Hierarchy Process (AHP) Matrix Math and Consistency Validation
Implements Saaty 1-9 scale, reciprocal matrix validation, geometric mean / principal eigenvector weights,
and CI / CR calculation with standard Random Index (RI) table.
"""
import numpy as np
from typing import Dict, List, Tuple, Optional

# Standard Saaty Random Consistency Index (RI) table for matrix sizes 1 to 10
RANDOM_INDEX = {
    1: 0.00,
    2: 0.00,
    3: 0.58,
    4: 0.90,
    5: 1.12,
    6: 1.24,
    7: 1.32,
    8: 1.41,
    9: 1.45,
    10: 1.49
}


def calculate_ahp_weights(matrix: np.ndarray) -> Tuple[np.ndarray, float, float, float, bool]:
    """
    Computes priority weights, lambda_max, Consistency Index (CI), and Consistency Ratio (CR)
    from a square pairwise comparison matrix.
    
    Returns:
        weights (np.ndarray): Normalized priority vector summing to 1.0.
        lambda_max (float): Principal eigenvalue estimate.
        ci (float): Consistency Index.
        cr (float): Consistency Ratio.
        is_consistent (bool): True if CR <= 0.10 (or n <= 2).
    """
    n = matrix.shape[0]
    if n != matrix.shape[1]:
        raise ValueError(f"AHP pairwise matrix must be square. Received shape {matrix.shape}")

    # Verify reciprocal symmetry
    for i in range(n):
        for j in range(n):
            if i == j:
                if not np.isclose(matrix[i, j], 1.0, atol=1e-3):
                    raise ValueError(f"Diagonal element [{i},{j}] must be 1.0. Received {matrix[i, j]}")
            else:
                prod = matrix[i, j] * matrix[j, i]
                if not np.isclose(prod, 1.0, atol=1e-2):
                    raise ValueError(f"Reciprocal violation at [{i},{j}]: {matrix[i, j]} * {matrix[j, i]} != 1.0")

    # Special trivial cases n <= 2
    if n == 1:
        return np.array([1.0]), 1.0, 0.0, 0.0, True
    if n == 2:
        w1 = matrix[0, 1] / (1.0 + matrix[0, 1])
        w2 = 1.0 / (1.0 + matrix[0, 1])
        return np.array([w1, w2]), 2.0, 0.0, 0.0, True

    # Normalized Geometric Mean Method (Logarithmic Least Squares / Saaty principal eigenvector equivalent)
    # Row geometric means
    geom_means = np.prod(matrix, axis=1) ** (1.0 / n)
    weights = geom_means / np.sum(geom_means)

    # Compute lambda_max: Aw = lambda * w -> lambda_max = (1/n) * sum((Aw)_i / w_i)
    aw = np.dot(matrix, weights)
    lambda_max = float(np.mean(aw / weights))

    # Consistency Index (CI)
    ci = (lambda_max - n) / (n - 1)
    ci = max(0.0, ci) # handle slight numerical precision negatives

    # Consistency Ratio (CR)
    ri = RANDOM_INDEX.get(n, 1.49)
    cr = ci / ri if ri > 0 else 0.0

    is_consistent = (cr <= 0.10)

    return weights, float(lambda_max), float(ci), float(cr), is_consistent


def aggregate_expert_matrices(matrices: List[np.ndarray]) -> np.ndarray:
    """
    Aggregates pairwise comparison matrices from multiple experts using the geometric mean.
    """
    if not matrices:
        raise ValueError("At least one expert matrix required for aggregation.")
    
    k = len(matrices)
    n = matrices[0].shape[0]
    agg_matrix = np.ones((n, n), dtype=float)
    
    for i in range(n):
        for j in range(n):
            product = 1.0
            for m in matrices:
                product *= m[i, j]
            agg_matrix[i, j] = product ** (1.0 / k)
            
    return agg_matrix
