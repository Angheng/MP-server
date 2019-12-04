module.exports = (sequelize, DataTypes) => {
    return sequelize.define( 
            'users', 
            {
                no: {
                    type: DataTypes.INTEGER(11),
                    primaryKey: true,
                },
                id: {
                    type: DataTypes.CHAR(15),
                    allowNull: false,
                },
                password: {
                    type: DataTypes.CHAR(15),
                    allowNull: false,
                },
           },
          );
};
