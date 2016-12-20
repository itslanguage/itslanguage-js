/**
 * Progress counter for challenges. Progress keeps track of the total challenges in a category and the amount
 * of challenges that are completed.
 */
export default class Progress {
  constructor(done, total) {
    this.done = done;
    this.total = total;
  }
}
