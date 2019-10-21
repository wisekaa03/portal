/** @format */

// #region Imports NPM
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';
// #endregion
// #region Imports Local
// #endregion

export class ProfileMigrate1571649703338 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    // companyEng
    await queryRunner.addColumn(
      'profile',
      new TableColumn({
        name: 'companyEng',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // nameEng
    await queryRunner.addColumn(
      'profile',
      new TableColumn({
        name: 'nameEng',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // departmentEng
    await queryRunner.addColumn(
      'profile',
      new TableColumn({
        name: 'departmentEng',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // otdelEng
    await queryRunner.addColumn(
      'profile',
      new TableColumn({
        name: 'otdelEng',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // positionEng
    await queryRunner.addColumn(
      'profile',
      new TableColumn({
        name: 'positionEng',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    // companyEng
    await queryRunner.dropColumn('question', 'companyEng');

    // nameEng
    await queryRunner.dropColumn('question', 'nameEng');

    // departmentEng
    await queryRunner.dropColumn('question', 'departmentEng');

    // otdelEng
    await queryRunner.dropColumn('question', 'otdelEng');

    // positionEng
    await queryRunner.dropColumn('question', 'positionEng');
  }
}
