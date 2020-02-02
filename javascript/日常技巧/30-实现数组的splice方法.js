Array.prototype._splice = function (startIndex, deleteCount = 0, ...insertedItems) {
  if (typeof startIndex !== 'number' || startIndex > this.length - 1) {
    throw new Error('invalid startIndex');
  }
  deleteCount = (deleteCount + startIndex) > this.length ? (this.length - startIndex) : deleteCount;
  insertedItems = Array.isArray(insertedItems) ? insertedItems : [];
  arrayLength = this.length - deleteCount + insertedItems.length;
  let removedItems;

  removedItems = removeItemsInArray(this, startIndex, deleteCount, insertedItems.length);

  moveItemsInArray(this, startIndex, deleteCount, insertedItems.length);

  for(let i = 0;i < insertedItems.length; ++i) {
    this[startIndex + i] = insertedItems[i];
  }

  this.length = arrayLength;

  return removedItems;

  function removeItemsInArray(array, startIndex, deleteCount, insertCount) {
    if (deleteCount === insertCount) {
      return [];
    }
    const deletedItems = [];
    for (let i = startIndex; i < startIndex + deleteCount; ++i) {
      deletedItems.push(array[i]);
    }
    return deletedItems;
  }

  function moveItemsInArray(array, startIndex, deleteCount, insertCount) {
    if (deleteCount === insertCount) {
      return;
    } else if (deleteCount > insertCount) {
      const moveCount = deleteCount - insertCount;
      for (let i = startIndex + deleteCount; i < array.length; ++i) {
        array[i - moveCount] = array[i];
        array[i] = undefined;
      }
    } else {
      const moveCount = insertCount - deleteCount;
      for (let i = array.length - 1; i >= startIndex + deleteCount; --i) {
        array[i + moveCount] = array[i];
        array[i] = undefined;
      }
    }
  }
}

const a = [1,2,3,4,5,6,7,8,9,10];
let b = a._splice(3, 0, 'a', 'c', 'd');
console.log(a);
console.log(b);