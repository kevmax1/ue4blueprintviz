module UE4Lib{
    'use strict';

    //Utility functions for line parsing
    class LineParser{
        private line: string;       //line
        private parsed: boolean;    //flag if line has been parsed
        private kv: {} = {};        //key value object

        constructor(line: string){
            this.set(line);
        }

        get(): string{
            return this.line.substr(0);
        }

        set(newLine: string): LineParser{
            this.line = newLine;
            this.parsed = false;
            this.kv = {};
            return this;
        }

        getIndentation(): number {
            var spaces: number;
            var trimmedLine = this.line.trim();

            spaces = this.line.indexOf(trimmedLine);

            if(spaces > 0){
                try {
                    if (spaces % 3 !== 0) {
                        throw 'malformed indentation level-> ' + spaces + ' spaces:' + this.line;
                    }
                }
                catch(e){
                    console.error(e);
                }
                return Math.floor(spaces/3);
            }

            return 0;
        }

        getKeyValues(): {} {
            var tokens: string[] = this.line.trim().split(' ');
            var values = {};

            if(this.isMultiStringToken(this.line)){
                tokens = [this.line.trim()];
            }
            else{
                //filter key value pairs
                tokens = tokens.filter(function(token: string): boolean{
                    if(token.indexOf('=') !== -1)
                        return true;
                    return false;
                });
            }

            //extract key value pairs
            tokens.forEach((token: string): void => {
                var split = token.indexOf('=');
                var key = token.substr(0,split).trim();
                var value = token.substr(split+1).trim();

                //todo don't leave values as strings
                values[key] = this.parseToken(value);
            });

            this.kv = values;
            return values;
        }

        getValueFor(key: string): any {
            if(!this.parsed)
                this.getKeyValues();

            return this.kv[key];
        }

        containsKey(key: string): boolean {
            if(!this.parsed)
                this.getKeyValues();

            return key in this.kv;
        }

        parseToken(token: string): string|number|{} {
            if(this.isStringToken(token)){
                token = token.substr(1, token.length - 2);
            }
            else if(this.isMultiToken(token)){
                token = token.substr(1, token.length - 2);

                var tokens = token.split(',');
                var values = {};

                tokens.forEach((token: string): void => {
                    var split = token.indexOf('=');
                    var key = token.substr(0,split).trim();
                    var value = token.substr(split+1).trim();

                    values[key] = this.parseToken(value);
                });

                return values;
            }

            var floatToken = parseFloat(token);
            if(!isNaN(floatToken))
                return floatToken;

            return token;
        }

        isClassStartTag(): boolean {
            return this.line.indexOf('Begin Object') != -1 && this.containsKey('Class') && this.containsKey('Name');
        }

        isClassEndTag(): boolean {
            return this.line.indexOf('End Object') != -1;
        }

        isStringToken(token: string): boolean {
            return token[0] === '"' && token[token.length - 1] === '"';
        }

        isMultiStringToken(token: string): boolean {
            var keys = [
                'NodeComment=',
                'ErrorMsg=',
                'PinToolTip='
            ];

            return keys.some(function(key){
                return token.trim().indexOf(key) === 0;
            });
        }

        isMultiToken(token: string): boolean {
            return token[0] === '(' && token[token.length - 1] === ')';
        }

        isObjectStartBlock(): boolean {
            return this.isClassStartTag() === false && this.containsKey('Name');
        }

        isObjectEndBlock(): boolean {
            return this.isClassEndTag();
        }
    }

    export class Parser{
        private blueprint: string[] = [];
        private lineParser = new LineParser("");
        private currentLine = 0;
        private malformed = false;

        constructor(blueprint: string){
            this.load(blueprint);
        }

        reset(): void{
            this.currentLine = 0;
            this.lineParser.set(this.blueprint[this.currentLine]);
        }

        load(blueprint: string): void{
            this.reset();
            this.blueprint = blueprint.split('\n');
            this.lineParser.set(this.blueprint[this.currentLine]);
        }

        line(): LineParser {
            return this.lineParser;
        }

        isEOF(): boolean{
            return this.currentLine >= this.blueprint.length;
        }

        isMalformed(): boolean{
            return this.malformed;
        }

        next(): void{
            this.currentLine++;
            if(this.currentLine < this.blueprint.length) {
                this.lineParser.set(this.blueprint[this.currentLine]);
            }
        }

        parseBlock(): {} {
            var blockLevel: number = this.line().getIndentation();
            var node = {};
            var name;
            var _class;

            this.next();

            //console.warn(this.line().getValueFor('Name'));

            //loop through the block
            while(!this.line().isClassEndTag() && this.line().getIndentation() !== blockLevel && !this.isEOF()){

                //check for class start tag in block e.g. nodes
                if(this.line().isClassStartTag() && this.line().getIndentation() === blockLevel+1){
                    name = this.line().getValueFor('Name');
                    _class = this.line().getValueFor('Class');
                    node[name] = this.parseBlock();
                    node[name].Name = name;
                    node[name].Class = _class;
                }
                //check for object start tag in block e.g. pin definitions
                else if(this.line().isObjectStartBlock() && this.line().getIndentation() === blockLevel+1){
                    name = this.line().getValueFor('Name');

                    if(name in node){
                        //append properties
                        var append = this.parseBlock();

                        Object.keys(append).forEach(function(key){
                            node[name][key] = append[key];
                        });
                    }
                    else{
                        node[name] = this.parseBlock();
                    }
                }
                //check for values in the block level
                else if(this.line().getIndentation() === blockLevel+1){
                    var values = this.line().getKeyValues();
                    var keys = Object.keys(values);

                    keys.forEach((key) => {
                        node[key] = values[key];
                    });
                }

                this.next();
            }

            //each block should end with 'End Object' on the same block level
            if(!this.line().isObjectEndBlock() && this.line().getIndentation() !== blockLevel) {
                this.malformed = true;
            }

            return node;
        }
    }
}