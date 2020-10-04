// This is my take on Conway's game of life (it is on a finite board instead of an infinite one)
// The game of life is a simulation that allows users to activate a set amount of
// squares on a grid and then once the simulation is played, a new generation of cells
// is created every one tenth of a second, if an activated cell has 2 or 3 neighbours, else
// it will be de-activated, a cell can be activated if it has 3 active neighbours

//cell objects are the little blocks that make up the grid
class cell {
  //the cell takes its row number and position in that row
  constructor(row, index) {
    this.div = document.createElement("div");
    this.div.classList.add("cell");
    //selected refrences whether the cell is active or not
    this.selected = false;
    this.row = row;
    this.index = index;
  }
  // toggle will reverse the selection status of the cell and as well change the
  // colour of the cell's div as a visual que for the user
  toggle() {
    if (this.selected === false) {
      this.div.style.backgroundColor = "black";
    } else {
      this.div.style.backgroundColor = "white";
    }
    this.selected = !this.selected;
  }

  //deselect makes sure that the cell is not active and it's colour is white
  deselect() {
    this.selected = false;
    this.div.style.backgroundColor = "white";
  }

  //select makes sure that the cell is active and it's colour is black
  select() {
    this.selected = true;
    this.div.style.backgroundColor = "black";
  }

  //check life is the function used to check wether the cell will be active or not in the next generation
  checkLife(grid) {
    //the cells on the outside edges are not updated in my version
    if (
      (0 < this.row) &
      (this.row < 49) &
      (0 < this.index) &
      (this.index < 49)
    ) {
      //The algorithm counts the amount of actuve neighbours by checking all
      //cells with in a king's move of the current cell
      let neighbours = 0;
      for (let r = this.row - 1; r <= this.row + 1; r++) {
        for (let x = this.index - 1; x <= this.index + 1; x++) {
          let currentCell = grid[r][x];
          if (currentCell != this) {
            if (currentCell.selected == true) {
              neighbours++;
            }
          }
        }
      }
      //if the cell is active and has less then two neighbours, or more than 3 neighbours, it is dead
      if (this.selected == true) {
        if (neighbours === 2 || neighbours === 3) {
          return "alive";
        } else {
          return "dead";
        }
      } else {
        //if the cell is not active and has 3 active neighbours then it will be activated in the next genration
        if (neighbours === 3) {
          return "alive";
        } else {
          return "dead";
        }
      }
    } else {
      return "dead";
    }
  }
}

//the grid class makes the grid object on wich the simulation takes place
class grid {
  constructor() {
    //the grid is used to store all of the cell objects
    this.grid = [];
    //starting grid is used for reseting the grid to how the user set it out before a simulation
    this.startingGrid = [];
    //grid div is the section in html where the cells are rendered
    this.gridDiv = document.querySelector(".grid");
    //cell count is the ammount of cells rendered in the grid
    this.cellCount = 0;
    //cells are placed in the grid and the controls are set up as soon as the grid object is created
    this.generateGrid();
    this.controlerSetup();
    //playing is set to true when a simulation is running
    this.playing = false;
  }

  //generate grid just fills the grid with cell objects
  generateGrid() {
    //in my current version there are 50 rows each with 50 cells
    for (let x = 0; x < 50; x++) {
      //create the row and add it to the grid and the gridDiv
      let row = document.createElement("div");
      row.classList.add("row");
      this.gridDiv.appendChild(row);
      this.grid.push([]);
      //also add a row to the starting grid as this will mirror the real grid
      this.startingGrid.push([]);
      for (let y = 0; y < 50; y++) {
        //create a cell object 50 times for each row
        let cellObject = new cell(x, y);
        this.cellCount++;
        //make sure that the cell cal be selected and deslected by being clicked on
        cellObject.div.addEventListener("click", function () {
          if (gridObject.playing === false) {
            cellObject.toggle();
          }
        });
        //add the cell to the grid
        this.grid[x].push(cellObject);
        //push a 0 to the starting grid to represent an inactive cell
        this.startingGrid[x].push(0);
        //add the cell div to the current row div
        row.appendChild(cellObject.div);
      }
    }
  }

  //the aniation fucntion controls the simulation
  async animation() {
    //first make a note of all the cells selected by the user in starting grid as 1's
    this.grid.forEach((row, x) => {
      row.forEach((cell, y) => {
        if (cell.selected === true) {
          this.startingGrid[x][y] = 1;
        }
      });
    });
    //setting playing to true will disable buttons and the ability for the user to select cells
    this.playing = true;
    //the simulation is ran within this loop, each pass of the loop is a 'generation'
    while (true) {
      let blankCount = 0;
      //this selection statement adds the functionality to the pause button
      if (this.playing === true) {
        //there is a 100ms pause between each generation
        await this.pause(0.1);
        //the new grid as updates to each cell are calculated, first, and then all updated at once, not live, first the
        //updates are calculated, then the grid is updated
        let newGrid = [];
        for (let i = 0; i < 50; i++) {
          newGrid.push([]);
        }
        //new grid is filled with 1's or 0's depending on whether a corresponding cell should be activated or deactivated
        this.grid.forEach((row, index) => {
          newGrid.push([]);
          row.forEach((cell) => {
            let status = cell.checkLife(this.grid);
            if (status === "dead") {
              newGrid[index].push(0);
              blankCount += 1;
            } else {
              newGrid[index].push(1);
            }
          });
        });
        // after all of the changes have been calculated, update the grid
        newGrid.forEach((row, rowIndex) => {
          row.forEach((cell, cellIndex) => {
            if (cell === 1) {
              this.grid[rowIndex][cellIndex].select();
            } else {
              this.grid[rowIndex][cellIndex].deselect();
            }
          });
        });
      } else {
        break;
      }
      //if no cells are active, then the simulation is over
      if (blankCount === this.cellCount) {
        break;
      }
    }
    //playing is set to false so that the controls are re-enabled
    this.playing = false;
    //the playbutton's colour is set back to black so that it is obvious the simulation is over
    let play = document.querySelector(".play-button");
    play.style.backgroundColor = "black";
  }

  //this function toggles a given cell in the starting grid
  updateStartingGrid(x, y) {
    if (this.startingGrid[x][y] === 0) {
      this.startingGrid[x][y] = 1;
    } else {
      this.startingGrid[x][y] = 0;
    }
  }

  //reset stops the simulation and takes the grid back to how it looked before the user clicked play, if the user
  //clicks reset again then the grid will be cleared
  async reset() {
    this.playing = false;
    let button = document.querySelector(".reset-button");
    button.style.backgroundColor = "red";
    //this pause fixed a bug where the reset button was not working properly
    await this.pause(0.5);
    button.style.backgroundColor = "black";
    let gridEmpty = true;
    //this checks if a changes has been made to the grid since the user last pressed reset
    this.startingGrid.forEach((row) => {
      row.forEach((cell) => {
        if (cell === 1) {
          gridEmpty = false;
        }
      });
    });
    //if the grid has been changed then the grid will be put back to its starting position before
    //the user ran the simulation
    if (gridEmpty === false) {
      this.grid.forEach((row, x) => {
        row.forEach((cell, y) => {
          if (this.startingGrid[x][y] === 0) {
            cell.deselect();
          } else {
            cell.select();
          }
          this.startingGrid[x][y] = 0;
        });
      });
    } else {
      //else the board is cleared
      this.grid.forEach((row) => {
        row.forEach((cell) => {
          cell.deselect();
        });
      });
    }
  }

  //controlerSetup adds functionality to the 3 controller buttons
  controlerSetup() {
    let play = document.querySelector(".play-button");
    play.addEventListener("click", function () {
      if (gridObject.playing === false) {
        //play button is linked to the animation function
        play.style.backgroundColor = "red";
        gridObject.animation();
      }
    });
    let pause = document.querySelector(".pause-button");
    pause.addEventListener("click", function () {
      //pause button just sets playing to false
      play.style.backgroundColor = "black";
      gridObject.playing = false;
    });
    let reset = document.querySelector(".reset-button");
    reset.addEventListener("click", function () {
      //reset button is linked to the reset function
      play.style.backgroundColor = "black";
      gridObject.reset();
    });
  }

  //pause is used to stop the processing of the program for a given amount of seconds
  pause(time) {
    return new Promise((resolve) => setTimeout(resolve, time * 1000));
  }
}

//this object is made each time the widow is loaded
const gridObject = new grid();
