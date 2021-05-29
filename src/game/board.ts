import {Coords, DEFAULT_GAME_CONFIG, SnakeType} from '../constants';
import {getRandomCoords} from '../helpers';
import {Snake} from './snake';

export class Board {
  snakes?: Snake[];
  bounds: Coords;
  selectedSnake = 0;
  food: Coords[] = [];
  wall: Coords[] = [];
  private _snakeCount = DEFAULT_GAME_CONFIG.snakeCount;
  private _snakeType = DEFAULT_GAME_CONFIG.snakeType;

  constructor(width: number, height: number) {
    this.bounds = {x: width, y: height};
  }

  get width(): number {
    return this.bounds.x;
  }

  get height(): number {
    return this.bounds.y;
  }

  get snakeCount(): number {
    return this._snakeCount;
  }

  get snakeType(): SnakeType {
    return this._snakeType;
  }

  setSnakeType(snakeType: SnakeType) {
    this._snakeType = snakeType;
  }

  setSnakeCount(snakeCount: number) {
    this._snakeCount = snakeCount;
  }

  resetBoard() {
    this.wall = [];
  }

  canProceed() {
    for (let i = 0; i < this.snakes.length; i++) {
      const snake = this.snakes[i];
      const hitWall = this.bumpToWall(snake.newHead);
      const hitSelf = this.bumpToSnake(snake.newHead);
      if (hitWall || hitSelf) {
        console.log('hitWall', hitWall);
        console.log('hitSelf', hitSelf);
        return false;
      }
    }
    return true;
  }

  private bumpToSnake(newHead: Coords): boolean {
    return this.snakes.some(snake => {
      return snake.sequence.some(
          segment => segment.x === newHead.x && segment.y === newHead.y);
    })
  }

  private bumpToWall(newHead: Coords): boolean {
    const bumpedToEdges = newHead.x < 0 || newHead.y < 0 ||
        newHead.x >= this.bounds.x || newHead.y >= this.bounds.y;
    const bumpedToCustomWalls =
        this.wall.find(({x, y}) => x === newHead.x && y === newHead.y);
    console.log('bumpedToEdges', bumpedToEdges);
    console.log('bumpedToCustomWalls', bumpedToCustomWalls);
    return bumpedToEdges || !!bumpedToCustomWalls;
  }

  setWalls(x: number, y: number) {
    const block: Coords = {x, y};

    const isNotAlreadyWall =
        !this.wall.find((block) => block.x === x && block.y === y);
    const isNotPartofSnake = !this.snakes.find(snake => {
      return snake.sequence.find(segment => segment.x === x && segment.y === y);
    });
    if (isNotAlreadyWall && isNotPartofSnake) {
      this.wall.push(block);
    }
  }

  removeWalls(x: number, y: number) {
    const block: Coords = {x, y};

    const index =
        this.wall.findIndex((block) => block.x === x && block.y === y);
    if (index >= 0) {
      this.wall.splice(index, 1);
    }
  }

  tick(): boolean {
    for (let i = 0; i < this.snakes.length; i++) {
      const snake = this.snakes[i];
      snake.step();

      const foodIndex = this.food.findIndex(
          (item) => item.x === snake.newHead.x && item.y === snake.newHead.y);

      if (foodIndex >= 0) {
        snake.grow();
        this.food.splice(foodIndex, 1);
        this.food.push(getRandomCoords(this.bounds));
        return true;
      }
    }
    return false;
  }
}