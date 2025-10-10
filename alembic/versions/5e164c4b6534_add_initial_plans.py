"""add_initial_plans

Revision ID: 5e164c4b6534
Revises: 065f99998d45
Create Date: 2025-10-10 11:26:45.956193

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5e164c4b6534'
down_revision: Union[str, None] = '065f99998d45'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
    INSERT INTO plans (name, price, description, features) VALUES
    ('Free', 0.0, 'Free plan with basic features', 'Access to basic dashboard, limited products'),
    ('Basic', 9.99, 'Basic plan with more features', 'Access to dashboard, unlimited products, basic analytics'),
    ('Premium', 19.99, 'Premium plan with all features', 'All features, advanced analytics, priority support')
    """)


def downgrade() -> None:
    pass
