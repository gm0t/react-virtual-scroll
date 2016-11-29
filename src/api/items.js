import { cloneElement } from 'react';
import assign from '../utils/assign';

export default class Items {
  constructor(children, itemHeight) {
    this.itemHeight = typeof(itemHeight) === 'number' ? itemHeight : 'auto';
    this.items = this.buildItems(children);
  }

  buildItems(children) {
    const height = this.itemHeight;
    let items = [], top = 0, item, minHeight = Infinity, maxHeight = -Infinity;
    for (let i = 0, l = children.length, props; i < l; i += 1) {
      item = {
        height: height === 'auto' ? this.getHeight(children[i]) : height,
        top: top
      };

      props = assign({}, children[i].props);
      props.style = props.style || {};
      props.style.position = 'absolute';
      props.style.top = item.top;

      item.cmp = cloneElement(children[i], props)
      items.push(item);
      minHeight = Math.min(minHeight, item.height);
      maxHeight = Math.max(maxHeight, item.height);
      top += item.height;
    }

    this.totalHeight = top;
    this.minHeight = minHeight;
    this.maxHeight = maxHeight;
    return items;
  }

  setChildren(children) {
    this.items = this.buildItems(children);
  }

  getHeight(child) {
    if (child.type && child.type.HEIGHT) {
      let height = child.type.HEIGHT;
      return + (typeof(height) === 'function' ? height(child.props) : height);
    }

    if (child.props.style && child.props.style.height) {
      let height = child.props.height;
      if (~height.indexOf('px')) {
        return parseInt(height, 10);
      } else if (!isNaN(+height)) {
        return +height;
      }
    }

    // TODO: what should we do with such items?
    return 0;
  }

  updateItemHeight(index, height) {
    let item = this.items[index];
    if (!item || item.height === height) {
      return false
    }

    item.height = height;
    return true;
  }

  buildRange(currentPos, itemsForBuffer, viewportHeight) {
    let start = this.getIndexByPos(currentPos) - itemsForBuffer,
      end = this.getIndexByPos(currentPos + viewportHeight) + itemsForBuffer,
      range = [];

    start = Math.max(start, 0);
    end = Math.min(end, this.items.length);

    for (let i = start; i < end; i += 1) {
      range.push(this.items[i].cmp);
    }

    return [start, end, range];
  }

  getIndexByPos(pos) {
    return this.itemHeight === 'auto' ?
      this._getIndexByPosVariableHeight(pos)
      : this._getIndexByPosStaticHeight(pos);
  }

  _getIndexByPosVariableHeight(pos) {
    const {minHeight, maxHeight, items, totalHeight} = this;

    if (pos < minHeight) {
      return 0;
    } else if (pos > totalHeight - minHeight) {
      return items.length;
    }

    // TODO: we can also replace minHeight with avgItemHeight in order to optimize loop
    for (let i = Math.floor(pos / maxHeight), l = items.length; i < l; i += 1) {
      if (items[i].top > pos) {
        return Math.max(i - 1, 0);
      }
      i += 1;
    }

    return items.length - 1;
  }

  _getIndexByPosStaticHeight(pos) {
    return Math.min(Math.max(Math.floor(pos / this.itemHeight), 0), this.items.length);
  }
}