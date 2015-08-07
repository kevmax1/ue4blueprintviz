module UE4Lib{
    'use strict';

    interface BP_Size{
        width: number;
        height: number;
    }

    interface BP_Pos{
        x: number;
        y: number;
    }

    interface INode{
        hasPin(pinName: string): boolean;
        getClass(): string;
        getName(): string;
        getProperty(name: string): any;
        getPosition(): BP_Pos;
        getSize(): BP_Size;
    }

    export class Node implements INode{
        private _data;
        private _pins: Pin[] = [];

        constructor(data){
            this._data = data;

            //filter pins
            var attributes = Object.keys(this._data);
            attributes.forEach((attr: string) => {
                if(attr.indexOf('EdGraphPin_') !== -1){
                    this._pins.push(new Pin(this._data[attr]));
                }
            });

        }

        getPosition(): BP_Pos{
            return {
                x: this.getProperty('NodePosX') || 0,
                y: this.getProperty('NodePosY') || 0
            }
        }

        getSize(): BP_Size{
            var width: number = this.getProperty('NodeWidth') || 0;
            var height: number = this.getProperty('NodeHeight') || 0;

            return {
                width: width,
                height: height
            }
        }

        getProperty(name: string): any{
            if(name in this._data)
                return this._data[name];

            return null;
        }

        getName(): string{
            return this.getProperty('Name');
        }

        getClass(): string{
            return this.getProperty('Class');
        }

        hasPin(pinName: string): boolean{
            return this._pins.some((pin: Pin) => {
                return pin.getName() === pinName ? true : false;
            });
        }

        getCommentColor(): number[]{
            const TitleBarColorMultiplier = 0.6;
            var color = this.getProperty('CommentColor');

            if(color !== null){
                return [
                    Math.floor(color.R * 255 * TitleBarColorMultiplier),  //R
                    Math.floor(color.G * 255 * TitleBarColorMultiplier),  //G
                    Math.floor(color.B * 255 * TitleBarColorMultiplier),  //B
                    Math.floor(color.A * 255 * TitleBarColorMultiplier)   //A
                ]
            }
            else if(this.getClass() === 'EdGraphNode_Comment'){
                //white
                return [
                    Math.floor(255 * TitleBarColorMultiplier),  //R
                    Math.floor(255 * TitleBarColorMultiplier),  //G
                    Math.floor(255 * TitleBarColorMultiplier),  //B
                    Math.floor(255 * TitleBarColorMultiplier)   //A
                ]
            }

            return null;
        }

        getCommentColorAsCSS(): string {
            var color = this.getCommentColor();

            if(color === null)
                return;

            return 'rgba(' + color.join(',') + ')';
        }
    }

    interface IPin{
        getProperty(property: string): any;
        getName(): string;
        getConnections(): string[]|void;
        isInput(): boolean;
        isOutput(): boolean;
        isHidden(): boolean;
        isConnected(): boolean;
    }

    class Pin implements IPin{
        private _data: {};
        private _connectedTo: string[] = [];

        constructor(parsedPin: {}){
            var keys: string[] = Object.keys(parsedPin);

            keys.forEach((key: string) => {
                if(key.indexOf('LinkedTo(') !== -1)
                    this._connectedTo.push(parsedPin[key]);
            });

            this._data = parsedPin;
        }

        getProperty(property: string): any{
            if(property in this._data)
                return this._data[property];

            return false;
        }

        getName(): string{
            return this.getProperty('Name');
        }

        isInput(): boolean{
            return !this.isOutput();
        }

        isOutput(): boolean{
            var direction = this.getProperty('Direction');

            if(direction !== false && direction === 'EGPD_Output')
                return true;

            return false;
        }

        isHidden(): boolean{
            var hidden = this.getProperty('bHidden');

            if(hidden !== false && hidden === 'True')
                return true;

            return false;
        }

        isConnected(): boolean{
            return this._connectedTo.length > 0 ? true : false;
        }

        getConnections(): string[]|void{
            return this._connectedTo;
        }

    }

    export type ParsedBlueprint = Array<{}>;

    interface IBlueprint{
        getSize(): BP_Size;
        getNodeByName(name: string): Node|void;
        getNodesByNames(names: string[]): Node[]|void;
        getNodeByPin(pinName: string): Node|void;
        getNodesByClass(classType: string): Node[]|void;
        getNodesByProperty(property: string): Node[]|void;
    }

    interface IBlueprintConfig {
        //blueprint dimensions
        offset: BP_Pos;
        size: BP_Size;
        padding: BP_Size;
    }

    class BlueprintConfig implements IBlueprintConfig {
        //offset from origin
        offset: BP_Pos = {
            x: 0,
            y: 0
        };

        //size of the blueprint
        size: BP_Size = {
            width: 0,
            height: 0
        };

        //safe area to add, so the outer nodes don't stick right to the edge
        //padding widt = 256 -> padding of 128 on left & right side = 1 grid padding on each side
        padding: BP_Size = {
            width: 256,
            height: 256
        };
    }

    export class Blueprint implements IBlueprint{
        private _data: Node[];
        private _config: BlueprintConfig = new BlueprintConfig();

        constructor(parsedBP: ParsedBlueprint){
            this._data = [];

            parsedBP.forEach((node) => {
                this._data.push(new Node(node));
            });

            this._config.size = this.calculateSize();
            console.group('size')
            console.dir(this._config.size);
            console.groupEnd();
            console.group('offset');
            console.dir(this._config.offset);
            console.groupEnd();
        }

        calculateSize(): BP_Size {
            var size = this._data[0].getSize();
            var position = this._data[0].getPosition();

            var min_X: number = position.x;
            var min_Y: number = position.y;
            var max_X: number = position.x + size.width;
            var max_Y: number = position.y + size.height;

            this._data.forEach((node: Node) => {
                var pos: BP_Pos = node.getPosition();
                var size: BP_Size = node.getSize();

                if(pos.x < min_X){
                    min_X = pos.x;
                }
                if(pos.x + size.width > max_X){
                    max_X = pos.x + size.width;
                }

                if(pos.y < min_Y){
                    min_Y = pos.y;
                }
                if(pos.y + size.height > max_Y){
                    max_Y = pos.y + size.height;
                }
            });

            //round offset to be power of 128(full grid)
            this._config.offset.x = (min_X % 128 !== 0) ? this._config.offset.x = Math.ceil(min_X / 128) * 128 : min_X;
            this._config.offset.y = (min_Y % 128 !== 0) ? this._config.offset.y = Math.ceil(min_Y / 128) * 128 : min_Y;

            //add padding offset
            this._config.offset.x -= Math.floor(this._config.padding.width/2);
            this._config.offset.y -= Math.floor(this._config.padding.height/2);

            return {
                width: Math.sqrt(Math.pow(min_X - max_X, 2)) + this._config.padding.width,
                height: Math.sqrt(Math.pow(min_Y - max_Y, 2)) + this._config.padding.height
            }
        }

        getSize(): BP_Size{
            if(this._config.size.width === -1 && this._config.size.height === -1)
                return this.calculateSize();

            return this._config.size;
        }

        getOffset(): BP_Pos {
            if(this._config.size.width === -1 && this._config.size.height === -1)
                this.calculateSize();

            return this._config.offset;
        }

        setPadding(width: number, height: number): void {
            this._config.padding = {
                width: Math.abs(width),
                height: Math.abs(height)
            };
        }

        getPadding(): BP_Size {
            return this._config.padding;
        }

        getNodeByName(name: string): Node|void{
            var match: Node = null;

            this._data.forEach((node: Node) => {
                if(node.getName() === name)
                    match = node;
            });

            return match;
        }

        getNodesByNames(names: string[]): Node[]|void{
            var matches: Node[] = [];

            names.forEach((name) => {
                var match: Node|void = this.getNodeByName(name);

                if(match !== null){
                    matches.push(<Node>match);
                }
            });

            return matches.length > 0 ? matches : null;
        }

        getNodesByClass(classType: string): Node[]|void{
            var nodes: Node[];

            nodes = this._data.filter((node: Node) => {
                return (node.getClass() === classType) ? true : false;
            });

            return nodes;
        }

        getNodesByProperty(property: string): Node[]|void{
            var filteredNodes: Node[] = [];

            this._data.forEach((node: Node) => {
                if(node.getProperty(property) !== null)
                    filteredNodes.push(node);
            });

            return filteredNodes;
        }

        getNodeByPin(pinName: string): Node|void{
            var match: Node = null;
            var found = this._data.some((node: Node) => {
                if(node.hasPin(pinName)){
                    match = node;

                    return true;
                }

                return false;
            });

            return (found !== false) ? match : null;
        }

        getNodes(): Node[] {
            return this._data;
        }
    }
}
