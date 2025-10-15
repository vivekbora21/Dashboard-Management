"""change_subscription_status_to_integer

Revision ID: fe81e8058b92
Revises: f52e1a9cde60
Create Date: 2025-10-15 13:02:09.892184

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fe81e8058b92'
down_revision: Union[str, None] = 'f52e1a9cde60'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Update existing data first: "active" -> 1, others -> 0
    op.execute("UPDATE subscriptions SET status = CASE WHEN status = 'active' THEN 1 ELSE 0 END")

    # Change status column from String to Integer
    op.alter_column('subscriptions', 'status',
                    existing_type=sa.String(length=50),
                    type_=sa.Integer(),
                    existing_nullable=True)


def downgrade() -> None:
    # Change status column back to String
    op.alter_column('subscriptions', 'status',
                    existing_type=sa.Integer(),
                    type_=sa.String(length=50),
                    existing_nullable=True,
                    postgresql_using='CASE WHEN status = 1 THEN \'active\' ELSE NULL END')

    # Update existing data: 1 -> "active", 0 -> NULL
    op.execute("UPDATE subscriptions SET status = CASE WHEN status = 1 THEN 'active' ELSE NULL END")
