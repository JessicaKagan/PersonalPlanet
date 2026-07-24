/** Helper methods for complex math, particularly around matrices. */

import { index, larger, matrix, mean, range, smaller, zeros, type Matrix } from "mathjs";

/** Given a 2-dimensional array of values representing a property, return a smoothed out version
 * using a box blur to average each value's height with its nearby neighbors.
 * @param sourceMatrix The array of values we want to blur, corresponding to a property in a multidimensional array (usually World tiles).
 * @param blurFactor The number of tiles to blur in each direction
 * @
 */
export function boxBlur(sourceMatrix: Matrix, blurFactor: number): Matrix {
        const newMatrix = matrix(zeros(sourceMatrix.size()[0], sourceMatrix.size()[1]));

        // When called this way, matrix.forEach() gives us the value of each element in the matrix, as well as its index (as an array with X and Y coordinates).
        sourceMatrix.forEach((value: number, tileIndex: number[]) => {
            // First, get the blurrable radius of each matrix element. This is usually equivalent to a square where each side's length is blurFactor * 2,
            // but with indices outside the matrix filtered out. 
            const x = tileIndex[0], y = tileIndex[1];
            const rangesForBlurring = {
                x: range(x - blurFactor, x + blurFactor).toArray().filter(x => {
                    return larger(x, 0) && smaller(x, sourceMatrix.size()[0]);
                }),
                y: range(y - blurFactor, y + blurFactor).toArray().filter(y => {
                    return larger(y, 0) && smaller(y, sourceMatrix.size()[1]);
                })
            };

            // Then, average together all the values in the element's blurrable radius.
            const mapValuesForBlurring = sourceMatrix.subset(index(rangesForBlurring.x, rangesForBlurring.y));
            const averageMapValue = mean(mapValuesForBlurring);

            newMatrix.subset(index(x, y), averageMapValue);
        });

        return newMatrix;
}