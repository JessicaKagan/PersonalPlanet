/** Helper methods that don't go anywhere else for the time being. */

/* Randomize an array in-place using Durstenfeld shuffle algorithm.
   Modified from https://stackoverflow.com/a/12646864/4885187. */
export function shuffleArray(array: any[]): void {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}