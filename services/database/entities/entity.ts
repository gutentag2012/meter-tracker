export default abstract class Entity {

  protected constructor(public id?: number) {
  }

  abstract getInsertionValues(): string;

}
