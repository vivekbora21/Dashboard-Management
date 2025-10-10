"""Consolidate plan fields into UserPlan table

Revision ID: ba9516aee180
Revises: 5e164c4b6534
Create Date: 2025-10-10 15:03:03.211730

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = 'ba9516aee180'
down_revision: Union[str, None] = '5e164c4b6534'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create user_plans table
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

    # Migrate data from users to user_plans
    op.execute("""
        INSERT INTO user_plans (user_id, plan_id, expiry, status, created_at)
        SELECT id, plan_id, plan_expiry, CASE WHEN is_active THEN 'active' ELSE 'inactive' END, NOW()
        FROM users
        WHERE plan_id IS NOT NULL
    """)

    # Remove plan fields from users table
    op.drop_column('users', 'plan_id')
    op.drop_column('users', 'plan_expiry')
    op.drop_column('users', 'is_active')
    # ### end Alembic commands ###


def downgrade() -> None:
    # Drop user_plans table
    op.drop_index(op.f('ix_user_plans_id'), table_name='user_plans')
    op.drop_table('user_plans')

    # Add back plan fields to users table
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, default=True))
    op.add_column('users', sa.Column('plan_expiry', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('plan_id', sa.Integer(), nullable=False, default=1))
    # ### end Alembic commands ###
