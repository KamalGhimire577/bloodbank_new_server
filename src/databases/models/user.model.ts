import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AllowNull,
  Default,
} from "sequelize-typescript";
import { UserRole } from "../../middleware/types.js";

@Table({
  tableName: "users",
  modelName: "User",
  timestamps: true,
})
class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    validate: {
      notEmpty: true,
      len: [3, 50],
    },
  })
  declare userName: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    validate: {
      notEmpty: true,
      len: [6, 100],
    },
  })
  declare password: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true,
    },
  })
  declare email: string;

  @AllowNull(false)
  @Default("user")
  @Column({
    type: DataType.ENUM("user", "donor", "admin"),
  })
  declare role: UserRole;

  // @AllowNull(true)
  // @Column({
  //   type: DataType.STRING,
  //   defaultValue: null,
  // })
  // declare bloodGroup: string | null;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    defaultValue: null,
  })
  declare phoneNumber: string ;

  // @AllowNull(true)
  //   @Column({
  //     type: DataType.STRING,
  //     defaultValue: null,
  //   })
  //   declare address: string | null;
  // }
}

export default User;
