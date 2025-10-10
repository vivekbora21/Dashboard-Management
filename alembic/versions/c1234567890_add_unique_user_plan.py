"""Add unique constraint to user_plans.user_id

Revision ID: c1234567890
Revises: ba9516aee180
Create Date: 2025-10-10 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c1234567890'
down_revision: Union[str, None] = 'ba9516aee180'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Remove duplicates, keeping the one with latest created_at per user
    op.execute("""
        DELETE FROM user_plans
        WHERE id IN (
            SELECT id FROM (
                SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
                FROM user_plans
            ) t
            WHERE t.rn > 1
        )
    """)

    # Add unique constraint to user_id
    op.create_unique_constraint('uq_user_plans_user_id', 'user_plans', ['user_id'])

    # Insert UserPlan for users without one (assign free plan id=1)
    op.execute("""
        INSERT INTO user_plans (user_id, plan_id, expiry, status, created_at)
        SELECT u.id, 1, NULL, 'active', NOW()
        FROM users u
        LEFT JOIN user_plans up ON u.id = up.user_id
        WHERE up.user_id IS NULL
    """)


def downgrade() -> None:
    # Remove the unique constraint
    op.drop_constraint('uq_user_plans_user_id', 'user_plans', type_='unique')

    # Note: No need to remove inserted rows, as downgrade would be manual
