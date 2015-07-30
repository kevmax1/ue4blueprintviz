/// <reference path="Blueprint.ts" />

module UE4Lib{
    'use strict';

    //static const float TitleBarColorMultiplier = 0.6f;

    var gridSize = 16;

    export class GridColor {
        static background: string = '#2A2A2A';
        static primaryLine: string = '#353535';
        static secondaryLine: string = '#1C1C1C';
    }

    interface DrawGridLineParams {
        ctx: CanvasRenderingContext2D;
        color: string;
        fromX: number;
        fromY: number;
        toX: number;
        toY: number;
    }
    function drawGridLine(params: DrawGridLineParams) : void {
        var ctx = params.ctx;

        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(params.fromX, params.fromY);
        ctx.lineTo(params.toX, params.toY);
        ctx.strokeStyle = params.color;
        ctx.stroke();
    }

    export function drawGrid(blueprint: Blueprint): void {
        var size = blueprint.getSize();
        console.log(blueprint.getSize());

        var canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('background');
        var ctx = canvas.getContext('2d');

        canvas.width = size.width;
        canvas.height = size.height;
        canvas.style.width = size.width + 'px';
        canvas.style.height = size.height + 'px';

        console.log(ctx.globalCompositeOperation);

        ctx.globalCompositeOperation = 'normal';
        ctx.fillStyle = GridColor.background;
        ctx.fillRect(10, 10, 100, 100);

        //draw small grid
        for(var i=1; i<canvas.width; i++){
            if(i % gridSize === 0){
                drawGridLine({
                    ctx: ctx,
                    color: GridColor.primaryLine,
                    fromX: i,
                    fromY: 0,
                    toX: i,
                    toY: canvas.height
                });
            }
        }

        for(var i=1; i<canvas.height; i++){
            if(i % gridSize === 0){
                drawGridLine({
                    ctx: ctx,
                    color: GridColor.primaryLine,
                    fromX: 0,
                    fromY: i,
                    toX: canvas.width,
                    toY: i
                });
            }
        }

        //draw big grid
        for(var i=1; i<canvas.width; i++){
            if(i % (gridSize * 8) === 0){
                drawGridLine({
                    ctx: ctx,
                    color: GridColor.secondaryLine,
                    fromX: i,
                    fromY: 0,
                    toX: i,
                    toY: canvas.height
                });
            }
        }

        for(var i=1; i<canvas.height; i++){
            if(i % (gridSize * 8) === 0){
                drawGridLine({
                    ctx: ctx,
                    color: GridColor.secondaryLine,
                    fromX: 0,
                    fromY: i,
                    toX: canvas.width,
                    toY: i
                });
            }
        }
    }
}
