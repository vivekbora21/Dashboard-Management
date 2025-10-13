"""Remove UserPlan table and migrate to subscriptions

Revision ID: f52e1a9cde60
Revises: c1234567890
Create Date: 2025-10-13 11:44:47.642528

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f52e1a9cde60'
down_revision: Union[str, None] = 'c1234567890'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Migrate existing UserPlan data to subscriptions
    op.execute("""
        INSERT INTO subscriptions (user_id, plan_id, start_date, end_date, status, created_at)
        SELECT user_id, plan_id, created_at, expiry, status, created_at
        FROM user_plans
        WHERE status = 'active'
    """)

    # Drop the user_plans table
    op.drop_index('ix_user_plans_id', table_name='user_plans')
    op.drop_table('user_plans')


def downgrade() -> None:
    # Recreate user_plans table
    op.create_table('user_plans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('plan_id', sa.Integer(), nullable=False),
        sa.Column('expiry', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['plan_id'], ['plans.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_plans_id'), 'user_plans', ['id'], unique=False)

    # Migrate back from subscriptions to user_plans (for active subscriptions)
    op.execute("""
        INSERT INTO user_plans (user_id, plan_id, expiry, status, created_at)
        SELECT user_id, plan_id, end_date, status, created_at
        FROM subscriptions
        WHERE status = 'active'
    """)
