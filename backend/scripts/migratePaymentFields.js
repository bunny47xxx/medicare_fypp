require('dotenv').config();
const { sequelize } = require('../viable/db');

async function migrate() {
  const q = sequelize.getQueryInterface();

  const cols = await q.describeTable('appointments');

  if (!cols.paymentStatus) {
    await q.addColumn('appointments', 'paymentStatus', {
      type: require('sequelize').DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'unpaid',
    });
    console.log('✅ Added paymentStatus');
  }

  if (!cols.paymentAmount) {
    await q.addColumn('appointments', 'paymentAmount', {
      type: require('sequelize').DataTypes.DECIMAL(10, 2),
      allowNull: true,
    });
    console.log('✅ Added paymentAmount');
  }

  if (!cols.esewaTransactionId) {
    await q.addColumn('appointments', 'esewaTransactionId', {
      type: require('sequelize').DataTypes.STRING,
      allowNull: true,
    });
    console.log('✅ Added esewaTransactionId');
  }

  if (!cols.esewaRefId) {
    await q.addColumn('appointments', 'esewaRefId', {
      type: require('sequelize').DataTypes.STRING,
      allowNull: true,
    });
    console.log('✅ Added esewaRefId');
  }

  console.log('Migration complete.');
  await sequelize.close();
}

migrate().catch(e => { console.error(e); process.exit(1); });
