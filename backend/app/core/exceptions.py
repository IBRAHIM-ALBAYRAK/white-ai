"""
app/core/exceptions.py

Centralized error handling for the entire project.
Instead of writing error responses in every module separately,
all exceptions are defined here once and reused everywhere.
This ensures the frontend always receives clean, consistent JSON error responses.
"""

from fastapi import HTTPException, status

class WhiteAIException(HTTPException):
    """Base exception class for WHITE.AI."""
    pass

# Auth exceptions
class UnauthorizedException(WhiteAIException):
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

class ForbiddenException(WhiteAIException):
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

# Resource exceptions
class NotFoundException(WhiteAIException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class AlreadyExistsException(WhiteAIException):
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)

# Business logic exceptions
class BadRequestException(WhiteAIException):
    def __init__(self, detail: str = "Bad request"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

class OvertimeException(WhiteAIException):
    """Raised when an employee exceeds weekly work hour limits."""
    def __init__(self, detail: str = "Employee has exceeded weekly overtime limits"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

class InsufficientStockException(WhiteAIException):
    """Raised when stock level drops below critical threshold."""
    def __init__(self, detail: str = "Insufficient stock level"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)