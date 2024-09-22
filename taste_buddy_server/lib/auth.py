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
