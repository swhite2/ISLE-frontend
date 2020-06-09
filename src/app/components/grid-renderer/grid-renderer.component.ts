import { Component, OnInit, AfterViewChecked, AfterViewInit, ViewChild, ElementRef, AfterContentInit, ViewChildren, Renderer2 } from '@angular/core';
import { SVG } from '@svgdotjs/svg.js';
import { defineGrid, extendHex } from 'honeycomb-grid';
import { LeapDataService, dataObject } from 'src/app/services/leap-data.service';
import { Subscriber, interval } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { ArtnetService } from 'src/app/services/artnet.service';

//declare var fluidSim: any;
declare var runSimulation: Function;
declare var convert: Function;

@Component({
  selector: 'app-grid-renderer',
  templateUrl: './grid-renderer.component.html',
  styleUrls: ['./grid-renderer.component.css']
})
export class GridRendererComponent implements OnInit, AfterViewInit, AfterViewChecked {

  pixelArray: Uint32Array;
  kernel: number[][];
  sampleOffset: number;
  normalizer: number;

  lightbarsOn: boolean = false;

  connectionIsClosed: boolean = true;

  @ViewChild('gridContainer', {read: ElementRef, static: true}) gridContainer: ElementRef;
  //gridContainer: any;

  dataSubscription: Subscriber<dataObject>; 

  hasIncomingData: boolean = false;

  width: number = 800;
  height: number = 500;
  drawSVG: any;

  rect_hand_left: any;
  rect_hand_right: any;

  grids: any[] = [];

  xpos_leap_left: any;
  ypos_leap_left: any;
  xpos_leap_right: any;
  ypos_leap_right: any;

  Hex: any;
  gridArr = [];
  Grid: any;

  // user defined amount of offset between each grid
  offsetIncrementor: number = 100;
  // User defined amount of grids, default is 8
  num_grids: number = 8;

  constructor(
    public leapDataService: LeapDataService,
    public artnetService: ArtnetService,
    private renderer: Renderer2,
    private el: ElementRef) {
      this.kernel = [
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
      ]
      this.sampleOffset = 0.0;
      this.normalizer = 25.0;
  }

  sample(hexCenterX: number, hexCentery: number){
    var halfSize = this.kernel.length /2;
    var r = 0.0;
    var g = 0.0;
    var b = 0.0;
    
    for(let i = 0; i < this.kernel.length; i++) {

    }
  }

  ngAfterViewInit() {

    runSimulation();
  //   fluidSim("demo", {
  //     threshold: false,
  //     advectV: true,
  //     applyPressure: true,
  //     showArrows: false,
  //     initCFn: [
  //         'step(1.0, mod(floor((x + 1.0) / 0.2) + floor((y + 1.0) / 0.2), 2.0))',
  //         'step(1.0, mod(floor((x + 1.0) / 0.3) + floor((y + 1.0) / 0.3), 2.0))',
  //         'step(1.0, mod(floor((x + 1.0) / 0.4) + floor((y + 1.0) / 0.4), 2.0))'
  //     ],
  //     dyeSpots: true,
  //     width: 800,
  //     height: 500
  // });
    //this.openConnection(); // Uncomment this line to enable a connection on startup.
  }

  saveSettings() {
    // Create logic for pushing the hexabar parameters to the server
  }

  openConnection(): void {
    this.dataSubscription = new Subscriber(data => {
      if (data) {
        this.hasIncomingData = true;  
        // let svg_obj = this.gridContainer.nativeElement;
        // let svg_left = 0;
        // let svg_top = 0;
        // while(svg_obj.offsetParent) {
        //   svg_left += svg_obj.offsetLeft;
        //   svg_top += svg_obj.offsetTop;
        //   svg_obj = svg_obj.offsetParent;
        // }
  
        // logic for moving the cursor here
        if (data.hand === 'left') {
          this.xpos_leap_left = data.x// - svg_left;
          this.ypos_leap_left = data.y// - svg_top;
          this.rect_hand_left.cx(this.xpos_leap_left).cy(this.ypos_leap_left);
          if (data.hex) {
            const hex = this.grids[data.currentGrid].get(data.hex);
            hex.highlight();          }
          //this.findCurrentGridAndHightlight(this.xpos_leap_left, this.ypos_leap_left, this.grids, this.Grid, this.offsetIncrementor);
        }
        if (data.hand === 'right') {
          this.xpos_leap_right = data.x// - svg_left;
          this.ypos_leap_right = data.y// - svg_top;
          this.rect_hand_right.cx(this.xpos_leap_right).cy(this.ypos_leap_right);
          if (data.hex) {
            //data.hex.highlight();
            const hex = this.grids[data.currentGrid].get(data.hex);
            hex.highlight();
          }
          //this.findCurrentGridAndHightlight(this.xpos_leap_right, this.ypos_leap_right, this.grids, this.Grid, this.offsetIncrementor);
        }
      }
    }, err => {
      console.error('Error: ' + err);
    }, () => {
      if (this.connectionIsClosed) {
        this.dataSubscription.unsubscribe();
        console.log('Unsubscribed from data subscription');
      }
    });
    //Receive leap data here
    this.connectionIsClosed = false;
    this.leapDataService.sendRequestForStreamingMessage()
      .pipe(throttleTime(16)) // Throttles to about 60fps, the server runs at ~240fps
      .subscribe(this.dataSubscription);
  }

  closeServerConnection() {
    this.hasIncomingData = false;
    this.connectionIsClosed = true;
    this.leapDataService.closeConnection();
    console.log('Disconnected from server');
  }

  ngOnInit() {
    this.renderGrids();
  }

  renderGrids(): Promise<boolean> {
    const gridsRendered = new Promise<boolean>((resolve, reject) => {
      console.log(this.drawSVG);
    // start benchmark time
    console.time();
    console.log(this.el.nativeElement);
    console.log(this.gridContainer.nativeElement.children);
    this.drawSVG = SVG().addTo(this.gridContainer.nativeElement).size(this.width, this.height);

    this.rect_hand_left = this.drawSVG.rect(10, 10).fill('#f06');
    this.rect_hand_right = this.drawSVG.rect(10, 10).fill('#66f');
    this.Hex = extendHex({
      size: 10,
      orientation: 'flat',

      render(draw, offsetX) {
        const { x, y } = this.toPoint();
        const corners = this.corners();
        const offsetCorners = corners.forEach(point => {
          point.x += offsetX;
        });
        this.corners = offsetCorners;

        this.draw = draw.polygon(corners.map(({ x, y }) => `${x}, ${y}`))
          .fill('none')
          .stroke({width: 1, color: '#999'})
          .translate(x, y)
      },

      highlight() {
        this.draw.fill({ opacity: 1, color: 'aquamarine'})
          .animate(1500)
          .fill({ opacity: 0, color: 'none'});
      }
    })

    this.Grid = defineGrid(this.Hex);
    
    let offset = 0;
    for (let i = 0; i < this.num_grids; i++) {
      this.gridArr = this.Grid.rectangle({
        width: 6,
        height: 28,

        onCreate: (hex: any) => {
          hex.render(this.drawSVG, offset) 
        }
      });
      this.grids.push(this.gridArr); 
      offset += this.offsetIncrementor;
    }
    
    //this.getMessages();

    resolve(true);
    console.timeEnd();
    });
    
    return gridsRendered;
  }

  ngAfterViewChecked() {
    this.pixelArray = convert(); //returns an UInt32Array object
    //console.log(this.pixelArray.length);
  }

  /**
   * 
   * @param {Number} pos_center_X 
   * @param {Number} pos_center_Y 
   * @param {Array} grid_array 
   * @param {any} defined_grid 
   * @param {Number} offsetIncrementor 
   */
  private findCurrentGridAndHightlight (pos_center_X, pos_center_Y, grid_array, defined_grid, offsetIncrementor) {
    for(let i = 0; i < grid_array.length; i++) {
      const offset = offsetIncrementor * i;
      const hexCoordinates = defined_grid.pointToHex([pos_center_X - offset, pos_center_Y]);
      const hex = grid_array[i].get(hexCoordinates)
      if(hex) {
        hex.highlight();
        //return {grid: grid_array[i], offset: offset};
      }
    }
  };

  /** \
   * unused
   * @param {any} hand_symbol the current hand
   * @param {Boolean} isSecondHand filters wether the current hex is being highlighted by a right hand
   * @param currentGrid  
   * @param defined_grid
   * @param {Number} offsetX The offset to subtract from the hand_symbol's center X position. This allows for a correct reading of the current grid
   */
  private checkForHex(hand_x, hand_y, isRightHand, currentGrid, defined_grid, offsetX) {
      const hexCoordinates = defined_grid.pointToHex([hand_x - offsetX, hand_y])
      const hex = currentGrid.get(hexCoordinates)
      if(hex) {
        // push values here
        //console.log(hex);
        //return hex;
        //console.log(hex);
        hex.highlight();
          //observable.
          // if(isRightHand) {
          //   document.getElementById('hexCoordinates_hand2').innerHTML = `Hexagonal coordinates hand2: x: ${hex.x}, y: ${hex.y}`
          // } else {
          //   document.getElementById('hexCoordinates_hand1').innerHTML = `Hexagonal coordinates hand1: x: ${hex.x}, y: ${hex.y}`
          // }            
      }
    
  } 

  enableLightbars() {
    this.leapDataService.enableLightbars();
    this.lightbarsOn = true;
  }

  disableLightbars() {
    this.leapDataService.disableLightbars();
    this.lightbarsOn = false;
  }
}
