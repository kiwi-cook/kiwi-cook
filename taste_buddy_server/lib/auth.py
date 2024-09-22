import re

import argon2

password_hasher = argon2.PasswordHasher()


def hash_password(password: str):
    """
    Hashes the password using argon2.
    Args:
        password: The password to hash.
    Returns: The hashed password.
    """
    password_hash = password_hasher.hash(password)
    return password_hash


def verify_password(plain_password: str, hashed_password: str):
    """
    Verifies the password using argon2.
    Args:
        plain_password: The plain password.
        hashed_password: The hashed password.
    Returns: True if the password is correct, False otherwise.
    """
    return password_hasher.verify(hashed_password, plain_password)


def is_secure_password(password: str) -> bool:
    """
    Checks if the password is secure based on multiple criteria.

    Args:
        password: The password to check.

    Returns:
        bool: True if the password is secure, False otherwise.
    """

    if (
        len(password) < 12
        or not re.search(r"[a-z]", password)
        or not re.search(r"[A-Z]", password)
        or not re.search(r"\d", password)
        or not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password)
    ):
        return False

    # Check for common patterns or words
    common_patterns = ["password", "123", "qwerty", "admin"]
    if any(pattern in password.lower() for pattern in common_patterns):
        return False

    return True
