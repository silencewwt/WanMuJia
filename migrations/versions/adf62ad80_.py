"""empty message

Revision ID: adf62ad80
Revises: 2f7c7f1d6ad
Create Date: 2015-11-15 21:27:08.170386

"""

# revision identifiers, used by Alembic.
revision = 'adf62ad80'
down_revision = '2f7c7f1d6ad'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.create_table('scenes',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('scene', sa.Unicode(length=20), nullable=False),
    sa.Column('father_id', sa.Integer(), nullable=False),
    sa.Column('level', sa.Integer(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('scenes')
    ### end Alembic commands ###