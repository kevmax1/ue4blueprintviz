module UE4Lib{
    'use strict';

    interface BP_Size{
        height: number;
        width: number;
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

    class Node implements INode{
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
                x: this.getProperty('NodePosX'),
                y: this.getProperty('NodePosY')
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

    export class Blueprint implements IBlueprint{
        private _data: Node[];

        constructor(parsedBP: ParsedBlueprint){
            this._data = [];

            parsedBP.forEach((node) => {
                this._data.push(new Node(node));
            });

        }

        //todo
        getSize(): BP_Size{

            return {
                height: 0,
                width: 0
            }
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

        //@debug
        printNodeClasses(): void{
            /*var classes = new Set();

             this._data.forEach((node: Node) => {
             classes.add(node.getClass());
             });

             classes.forEach((_class) => {
             console.log(_class);
             });*/
        }
    }
}
