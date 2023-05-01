export default abstract class Entity {

  protected constructor(public id?: number) {
  }

  abstract getInsertionValues(forceId?: boolean): string;
  abstract getUpdateStatement(): string;

  abstract getCSVValues(withChildren?: boolean): string;

}
