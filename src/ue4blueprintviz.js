var ue4viz;
(function (ue4viz) {
    var ParseMode;
    (function (ParseMode) {
        ParseMode[ParseMode["NONE"] = 0] = "NONE";
        ParseMode[ParseMode["OBJECTSTART"] = 1] = "OBJECTSTART";
        ParseMode[ParseMode["OBJECTEND"] = 2] = "OBJECTEND";
        ParseMode[ParseMode["VALUE"] = 3] = "VALUE";
        ParseMode[ParseMode["PIN"] = 4] = "PIN";
    })(ParseMode || (ParseMode = {}));
    ;
    //Utility functions for line parsing
    var LineParser = (function () {
        function LineParser(line) {
            this.kv = {}; //key value object
            this.set(line);
        }
        LineParser.prototype.get = function () {
            return this.line.substr(0);
        };
        LineParser.prototype.set = function (newLine) {
            this.line = newLine;
            this.parsed = false;
            this.kv = {};
            return this;
        };
        LineParser.prototype.getIdentation = function () {
            var spaces;
            var trimmedLine = this.line.trim();
            spaces = this.line.indexOf(trimmedLine);
            if (spaces > 0) {
                if (spaces % 3 !== 0) {
                    console.warn('malformed indentation level-> ' + spaces + ' spaces:' + this.line);
                }
                return Math.floor(spaces / 3);
            }
            return 0;
        };
        LineParser.prototype.getKeyValues = function () {
            var tokens = this.line.split(' ');
            var values = {};
            //filter key value pairs
            tokens.filter(function (token) {
                if (token.indexOf('=') !== -1)
                    return true;
                return false;
            });
            //extract key value pairs
            tokens.forEach(function (token) {
                var split = token.indexOf('=');
                var key = token.substr(0, split);
                var value = token.substr(split + 1);
                //todo don't leave values as strings
                values[key] = value;
            });
            this.kv = values;
            return values;
        };
        LineParser.prototype.getValueFor = function (key) {
            if (!this.parsed)
                this.getKeyValues();
            return this.kv[key];
        };
        LineParser.prototype.containsKey = function (key) {
            if (!this.parsed)
                this.getKeyValues();
            return key in this.kv;
        };
        LineParser.prototype.isClassStartTag = function () {
            return this.line.indexOf('Begin Object') != -1 && this.containsKey('Class') && this.containsKey('Name');
        };
        LineParser.prototype.isClassEndTag = function () {
            return this.line.indexOf('End Object') != -1;
        };
        return LineParser;
    })();
    var Parser = (function () {
        function Parser(blueprint) {
            this.blueprint = [];
            this.lineParser = new LineParser("");
            this.currentLine = 0;
            this.currentIdentation = 0;
            this.mode = 0 /* NONE */;
            this.load(blueprint);
        }
        Parser.prototype.reset = function () {
            this.currentLine = 0;
            this.lineParser.set(this.blueprint[this.currentLine]);
            this.mode = 0 /* NONE */;
        };
        Parser.prototype.load = function (blueprint) {
            this.reset();
            this.blueprint = blueprint.split('\n');
            this.lineParser.set(this.blueprint[this.currentLine]);
        };
        Parser.prototype.line = function () {
            return this.lineParser;
        };
        Parser.prototype.isEOF = function () {
            return this.currentLine >= this.blueprint.length;
        };
        Parser.prototype.next = function () {
            this.currentLine++;
            if (this.currentLine < this.blueprint.length) {
                this.lineParser.set(this.blueprint[this.currentLine]);
            }
        };
        return Parser;
    })();
    function parseBlueprint() {
        var blueprint = 'QmVnaW4gT2JqZWN0IENsYXNzPUVkR3JhcGhOb2RlX0NvbW1lbnQgTmFtZT0iRWRHcmFwaE5vZGVfQ29tbWVudF82MSINCiAgIENvbW1lbnRDb2xvcj0oUj0xLjAwMDAwMCxHPTAuMjc1MDAwLEI9MC4yNzUwMDAsQT0xLjAwMDAwMCkNCiAgIE5vZGVQb3NYPTU3Ng0KICAgTm9kZVBvc1k9MzA0DQogICBOb2RlV2lkdGg9NDY0DQogICBOb2RlSGVpZ2h0PTMzNg0KICAgTm9kZUNvbW1lbnQ9Ik15IENvbW1lbnQiDQogICBOb2RlR3VpZD0wOThENEQ3ODRGOTlBQjYzNjdBOTNGOTAyQ0RBNEQ4Mg0KRW5kIE9iamVjdA0KQmVnaW4gT2JqZWN0IENsYXNzPUsyTm9kZV9WYXJpYWJsZUdldCBOYW1lPSJLMk5vZGVfVmFyaWFibGVHZXRfNzkiDQogICBCZWdpbiBPYmplY3QgQ2xhc3M9RWRHcmFwaFBpbiBOYW1lPSJFZEdyYXBoUGluXzQ2MjUiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgQ2xhc3M9RWRHcmFwaFBpbiBOYW1lPSJFZEdyYXBoUGluXzQ2MjYiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgTmFtZT0iRWRHcmFwaFBpbl80NjI1Ig0KICAgICAgUGluTmFtZT0iU3RyaW5nVmFyIg0KICAgICAgRGlyZWN0aW9uPUVHUERfT3V0cHV0DQogICAgICBQaW5UeXBlPShQaW5DYXRlZ29yeT0idGV4dCIpDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgTmFtZT0iRWRHcmFwaFBpbl80NjI2Ig0KICAgICAgUGluTmFtZT0ic2VsZiINCiAgICAgIFBpblR5cGU9KFBpbkNhdGVnb3J5PSJvYmplY3QiLFBpblN1YkNhdGVnb3J5PSJzZWxmIikNCiAgICAgIGJIaWRkZW49VHJ1ZQ0KICAgRW5kIE9iamVjdA0KICAgVmFyaWFibGVSZWZlcmVuY2U9KE1lbWJlck5hbWU9IlN0cmluZ1ZhciIsYlNlbGZDb250ZXh0PVRydWUpDQogICBQaW5zKDApPUVkR3JhcGhQaW4nRWRHcmFwaFBpbl80NjI1Jw0KICAgUGlucygxKT1FZEdyYXBoUGluJ0VkR3JhcGhQaW5fNDYyNicNCiAgIE5vZGVQb3NYPTI0MA0KICAgTm9kZVBvc1k9Mjg4DQogICBOb2RlR3VpZD03QjFERDMyRDRGMjZCQjhGQzVFRkM3QTM5RDUzNjY1QQ0KRW5kIE9iamVjdA0KQmVnaW4gT2JqZWN0IENsYXNzPUsyTm9kZV9WYXJpYWJsZVNldCBOYW1lPSJLMk5vZGVfVmFyaWFibGVTZXRfODciDQogICBCZWdpbiBPYmplY3QgQ2xhc3M9RWRHcmFwaFBpbiBOYW1lPSJFZEdyYXBoUGluXzQ2MjciDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgQ2xhc3M9RWRHcmFwaFBpbiBOYW1lPSJFZEdyYXBoUGluXzQ2MjgiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgQ2xhc3M9RWRHcmFwaFBpbiBOYW1lPSJFZEdyYXBoUGluXzQ2MjkiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgQ2xhc3M9RWRHcmFwaFBpbiBOYW1lPSJFZEdyYXBoUGluXzQ2MzAiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgTmFtZT0iRWRHcmFwaFBpbl80NjI3Ig0KICAgICAgUGluTmFtZT0iZXhlY3V0ZSINCiAgICAgIFBpblR5cGU9KFBpbkNhdGVnb3J5PSJleGVjIikNCiAgIEVuZCBPYmplY3QNCiAgIEJlZ2luIE9iamVjdCBOYW1lPSJFZEdyYXBoUGluXzQ2MjgiDQogICAgICBQaW5OYW1lPSJ0aGVuIg0KICAgICAgRGlyZWN0aW9uPUVHUERfT3V0cHV0DQogICAgICBQaW5UeXBlPShQaW5DYXRlZ29yeT0iZXhlYyIpDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgTmFtZT0iRWRHcmFwaFBpbl80NjI5Ig0KICAgICAgUGluTmFtZT0iU3RyaW5nVmFyIg0KICAgICAgUGluVHlwZT0oUGluQ2F0ZWdvcnk9InRleHQiKQ0KICAgICAgRGVmYXVsdFRleHRWYWx1ZT0iSGVsbG8gV29ybGQiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgTmFtZT0iRWRHcmFwaFBpbl80NjMwIg0KICAgICAgUGluTmFtZT0ic2VsZiINCiAgICAgIFBpblR5cGU9KFBpbkNhdGVnb3J5PSJvYmplY3QiLFBpblN1YkNhdGVnb3J5PSJzZWxmIikNCiAgICAgIGJIaWRkZW49VHJ1ZQ0KICAgRW5kIE9iamVjdA0KICAgVmFyaWFibGVSZWZlcmVuY2U9KE1lbWJlck5hbWU9IlN0cmluZ1ZhciIsYlNlbGZDb250ZXh0PVRydWUpDQogICBQaW5zKDApPUVkR3JhcGhQaW4nRWRHcmFwaFBpbl80NjI3Jw0KICAgUGlucygxKT1FZEdyYXBoUGluJ0VkR3JhcGhQaW5fNDYyOCcNCiAgIFBpbnMoMik9RWRHcmFwaFBpbidFZEdyYXBoUGluXzQ2MjknDQogICBQaW5zKDMpPUVkR3JhcGhQaW4nRWRHcmFwaFBpbl80NjMwJw0KICAgTm9kZVBvc1g9MjQwDQogICBOb2RlUG9zWT0zNTINCiAgIE5vZGVHdWlkPTY4RTc4RDY0NEUzN0U3MTgxQjA3RDBBM0NFNkY3N0Y4DQpFbmQgT2JqZWN0DQpCZWdpbiBPYmplY3QgQ2xhc3M9SzJOb2RlX0V2ZW50IE5hbWU9IksyTm9kZV9FdmVudF8xMTYiDQogICBCZWdpbiBPYmplY3QgQ2xhc3M9RWRHcmFwaFBpbiBOYW1lPSJFZEdyYXBoUGluXzQ2MzEiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgQ2xhc3M9RWRHcmFwaFBpbiBOYW1lPSJFZEdyYXBoUGluXzQ2MzIiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgTmFtZT0iRWRHcmFwaFBpbl80NjMxIg0KICAgICAgUGluTmFtZT0iT3V0cHV0RGVsZWdhdGUiDQogICAgICBEaXJlY3Rpb249RUdQRF9PdXRwdXQNCiAgICAgIFBpblR5cGU9KFBpbkNhdGVnb3J5PSJkZWxlZ2F0ZSIsUGluU3ViQ2F0ZWdvcnlPYmplY3Q9RnVuY3Rpb24nL1NjcmlwdC9FbmdpbmUuQWN0b3I6UmVjZWl2ZUJlZ2luUGxheScpDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgTmFtZT0iRWRHcmFwaFBpbl80NjMyIg0KICAgICAgUGluTmFtZT0idGhlbiINCiAgICAgIERpcmVjdGlvbj1FR1BEX091dHB1dA0KICAgICAgUGluVHlwZT0oUGluQ2F0ZWdvcnk9ImV4ZWMiKQ0KICAgICAgTGlua2VkVG8oMCk9RWRHcmFwaFBpbiciSzJOb2RlX1ZhcmlhYmxlU2V0XzExNS5FZEdyYXBoUGluXzQ2NDAiJw0KICAgRW5kIE9iamVjdA0KICAgRXZlbnRTaWduYXR1cmVOYW1lPSJSZWNlaXZlQmVnaW5QbGF5Ig0KICAgRXZlbnRTaWduYXR1cmVDbGFzcz1DbGFzcycvU2NyaXB0L0VuZ2luZS5BY3RvcicNCiAgIGJPdmVycmlkZUZ1bmN0aW9uPVRydWUNCiAgIFBpbnMoMCk9RWRHcmFwaFBpbidFZEdyYXBoUGluXzQ2MzEnDQogICBQaW5zKDEpPUVkR3JhcGhQaW4nRWRHcmFwaFBpbl80NjMyJw0KICAgTm9kZVBvc1g9NTEyDQogICBOb2RlUG9zWT0xNDQNCiAgIE5vZGVHdWlkPTZGMjJBQUE0NDdDQUVCMEQxMkI4Qzc4REI3QjFGRTlCDQpFbmQgT2JqZWN0DQpCZWdpbiBPYmplY3QgQ2xhc3M9SzJOb2RlX1ZhcmlhYmxlU2V0IE5hbWU9IksyTm9kZV9WYXJpYWJsZVNldF8xMTUiDQogICBCZWdpbiBPYmplY3QgQ2xhc3M9RWRHcmFwaFBpbiBOYW1lPSJFZEdyYXBoUGluXzQ2NDAiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgQ2xhc3M9RWRHcmFwaFBpbiBOYW1lPSJFZEdyYXBoUGluXzQ2NDEiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgQ2xhc3M9RWRHcmFwaFBpbiBOYW1lPSJFZEdyYXBoUGluXzQ2NDIiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgQ2xhc3M9RWRHcmFwaFBpbiBOYW1lPSJFZEdyYXBoUGluXzQ2NDMiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgTmFtZT0iRWRHcmFwaFBpbl80NjQwIg0KICAgICAgUGluTmFtZT0iZXhlY3V0ZSINCiAgICAgIFBpblR5cGU9KFBpbkNhdGVnb3J5PSJleGVjIikNCiAgICAgIExpbmtlZFRvKDApPUVkR3JhcGhQaW4nIksyTm9kZV9FdmVudF8xMTYuRWRHcmFwaFBpbl80NjMyIicNCiAgIEVuZCBPYmplY3QNCiAgIEJlZ2luIE9iamVjdCBOYW1lPSJFZEdyYXBoUGluXzQ2NDEiDQogICAgICBQaW5OYW1lPSJ0aGVuIg0KICAgICAgRGlyZWN0aW9uPUVHUERfT3V0cHV0DQogICAgICBQaW5UeXBlPShQaW5DYXRlZ29yeT0iZXhlYyIpDQogICAgICBMaW5rZWRUbygwKT1FZEdyYXBoUGluJyJLMk5vZGVfQ2FsbEZ1bmN0aW9uXzgzMjMuRWRHcmFwaFBpbl80NjQ0IicNCiAgIEVuZCBPYmplY3QNCiAgIEJlZ2luIE9iamVjdCBOYW1lPSJFZEdyYXBoUGluXzQ2NDIiDQogICAgICBQaW5OYW1lPSJDdXN0b21UaW1lRGlsYXRpb24iDQogICAgICBQaW5UeXBlPShQaW5DYXRlZ29yeT0iZmxvYXQiKQ0KICAgICAgRGVmYXVsdFZhbHVlPSIwLjAiDQogICAgICBBdXRvZ2VuZXJhdGVkRGVmYXVsdFZhbHVlPSIwLjAiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgTmFtZT0iRWRHcmFwaFBpbl80NjQzIg0KICAgICAgUGluTmFtZT0ic2VsZiINCiAgICAgIFBpblR5cGU9KFBpbkNhdGVnb3J5PSJvYmplY3QiLFBpblN1YkNhdGVnb3J5PSJzZWxmIikNCiAgICAgIGJIaWRkZW49VHJ1ZQ0KICAgRW5kIE9iamVjdA0KICAgVmFyaWFibGVSZWZlcmVuY2U9KE1lbWJlck5hbWU9IkN1c3RvbVRpbWVEaWxhdGlvbiIsYlNlbGZDb250ZXh0PVRydWUpDQogICBQaW5zKDApPUVkR3JhcGhQaW4nRWRHcmFwaFBpbl80NjQwJw0KICAgUGlucygxKT1FZEdyYXBoUGluJ0VkR3JhcGhQaW5fNDY0MScNCiAgIFBpbnMoMik9RWRHcmFwaFBpbidFZEdyYXBoUGluXzQ2NDInDQogICBQaW5zKDMpPUVkR3JhcGhQaW4nRWRHcmFwaFBpbl80NjQzJw0KICAgTm9kZVBvc1g9NzUyDQogICBOb2RlUG9zWT0xNzYNCiAgIE5vZGVHdWlkPUU1MUYyMDBFNEI1QzU1ODFDMzBFRkRBNTlDQjYxNjk4DQpFbmQgT2JqZWN0DQpCZWdpbiBPYmplY3QgQ2xhc3M9SzJOb2RlX0NhbGxGdW5jdGlvbiBOYW1lPSJLMk5vZGVfQ2FsbEZ1bmN0aW9uXzgzMjMiDQogICBCZWdpbiBPYmplY3QgQ2xhc3M9RWRHcmFwaFBpbiBOYW1lPSJFZEdyYXBoUGluXzQ2NDQiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgQ2xhc3M9RWRHcmFwaFBpbiBOYW1lPSJFZEdyYXBoUGluXzQ2NDUiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgQ2xhc3M9RWRHcmFwaFBpbiBOYW1lPSJFZEdyYXBoUGluXzQ2NDYiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgQ2xhc3M9RWRHcmFwaFBpbiBOYW1lPSJFZEdyYXBoUGluXzQ2NDciDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgQ2xhc3M9RWRHcmFwaFBpbiBOYW1lPSJFZEdyYXBoUGluXzQ2NDgiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgQ2xhc3M9RWRHcmFwaFBpbiBOYW1lPSJFZEdyYXBoUGluXzQ2NDkiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgQ2xhc3M9RWRHcmFwaFBpbiBOYW1lPSJFZEdyYXBoUGluXzQ2NTAiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgTmFtZT0iRWRHcmFwaFBpbl80NjQ0Ig0KICAgICAgUGluTmFtZT0iZXhlY3V0ZSINCiAgICAgIFBpblR5cGU9KFBpbkNhdGVnb3J5PSJleGVjIikNCiAgICAgIExpbmtlZFRvKDApPUVkR3JhcGhQaW4nIksyTm9kZV9WYXJpYWJsZVNldF8xMTUuRWRHcmFwaFBpbl80NjQxIicNCiAgIEVuZCBPYmplY3QNCiAgIEJlZ2luIE9iamVjdCBOYW1lPSJFZEdyYXBoUGluXzQ2NDUiDQogICAgICBQaW5OYW1lPSJ0aGVuIg0KICAgICAgRGlyZWN0aW9uPUVHUERfT3V0cHV0DQogICAgICBQaW5UeXBlPShQaW5DYXRlZ29yeT0iZXhlYyIpDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgTmFtZT0iRWRHcmFwaFBpbl80NjQ2Ig0KICAgICAgUGluTmFtZT0ic2VsZiINCiAgICAgIFBpbkZyaWVuZGx5TmFtZT0iVGFyZ2V0Ig0KICAgICAgUGluVG9vbFRpcD0iVGFyZ2V0XG5LaXNtZXQgU3lzdGVtIExpYnJhcnkgUmVmZXJlbmNlIg0KICAgICAgUGluVHlwZT0oUGluQ2F0ZWdvcnk9Im9iamVjdCIsUGluU3ViQ2F0ZWdvcnlPYmplY3Q9Q2xhc3MnL1NjcmlwdC9FbmdpbmUuS2lzbWV0U3lzdGVtTGlicmFyeScpDQogICAgICBEZWZhdWx0T2JqZWN0PURlZmF1bHRfX0tpc21ldFN5c3RlbUxpYnJhcnkNCiAgICAgIGJIaWRkZW49VHJ1ZQ0KICAgRW5kIE9iamVjdA0KICAgQmVnaW4gT2JqZWN0IE5hbWU9IkVkR3JhcGhQaW5fNDY0NyINCiAgICAgIFBpbk5hbWU9Ik9iamVjdCINCiAgICAgIFBpblRvb2xUaXA9Ik9iamVjdFxuT2JqZWN0IFJlZmVyZW5jZVxuXG5PYmplY3QgdGhhdCBpbXBsZW1lbnRzIHRoZSBkZWxlZ2F0ZSBmdW5jdGlvbi4gRGVmYXVsdHMgdG8gc2VsZiAodGhpcyBibHVlcHJpbnQpIg0KICAgICAgUGluVHlwZT0oUGluQ2F0ZWdvcnk9Im9iamVjdCIsUGluU3ViQ2F0ZWdvcnlPYmplY3Q9Q2xhc3MnL1NjcmlwdC9Db3JlVU9iamVjdC5PYmplY3QnKQ0KICAgRW5kIE9iamVjdA0KICAgQmVnaW4gT2JqZWN0IE5hbWU9IkVkR3JhcGhQaW5fNDY0OCINCiAgICAgIFBpbk5hbWU9IkZ1bmN0aW9uTmFtZSINCiAgICAgIFBpblRvb2xUaXA9IkZ1bmN0aW9uIE5hbWVcblN0cmluZ1xuXG5EZWxlZ2F0ZSBmdW5jdGlvbiBuYW1lLiBDYW4gYmUgYSBLMiBmdW5jdGlvbiBvciBhIEN1c3RvbSBFdmVudC4iDQogICAgICBQaW5UeXBlPShQaW5DYXRlZ29yeT0ic3RyaW5nIikNCiAgIEVuZCBPYmplY3QNCiAgIEJlZ2luIE9iamVjdCBOYW1lPSJFZEdyYXBoUGluXzQ2NDkiDQogICAgICBQaW5OYW1lPSJUaW1lIg0KICAgICAgUGluVG9vbFRpcD0iVGltZVxuRmxvYXRcblxuSG93IGxvbmcgdG8gd2FpdCBiZWZvcmUgZXhlY3V0aW5nIHRoZSBkZWxlZ2F0ZSwgaW4gc2Vjb25kcy4gU2V0dGluZyBhIHRpbWVyIHRvIDw9IDAgc2Vjb25kcyB3aWxsIGNsZWFyIGl0IGlmIGl0IGlzIHNldC4iDQogICAgICBQaW5UeXBlPShQaW5DYXRlZ29yeT0iZmxvYXQiKQ0KICAgICAgRGVmYXVsdFZhbHVlPSIwLjAiDQogICAgICBBdXRvZ2VuZXJhdGVkRGVmYXVsdFZhbHVlPSIwLjAiDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgTmFtZT0iRWRHcmFwaFBpbl80NjUwIg0KICAgICAgUGluTmFtZT0iYkxvb3BpbmciDQogICAgICBQaW5Ub29sVGlwPSJMb29waW5nXG5Cb29sZWFuXG5cbnRydWUgdG8ga2VlcCBleGVjdXRpbmcgdGhlIGRlbGVnYXRlIGV2ZXJ5IFRpbWUgc2Vjb25kcywgZmFsc2UgdG8gZXhlY3V0ZSBkZWxlZ2F0ZSBvbmx5IG9uY2UuIg0KICAgICAgUGluVHlwZT0oUGluQ2F0ZWdvcnk9ImJvb2wiKQ0KICAgICAgRGVmYXVsdFZhbHVlPSJmYWxzZSINCiAgICAgIEF1dG9nZW5lcmF0ZWREZWZhdWx0VmFsdWU9ImZhbHNlIg0KICAgRW5kIE9iamVjdA0KICAgRnVuY3Rpb25SZWZlcmVuY2U9KE1lbWJlclBhcmVudENsYXNzPUNsYXNzJy9TY3JpcHQvRW5naW5lLktpc21ldFN5c3RlbUxpYnJhcnknLE1lbWJlck5hbWU9IksyX1NldFRpbWVyIikNCiAgIFBpbnMoMCk9RWRHcmFwaFBpbidFZEdyYXBoUGluXzQ2NDQnDQogICBQaW5zKDEpPUVkR3JhcGhQaW4nRWRHcmFwaFBpbl80NjQ1Jw0KICAgUGlucygyKT1FZEdyYXBoUGluJ0VkR3JhcGhQaW5fNDY0NicNCiAgIFBpbnMoMyk9RWRHcmFwaFBpbidFZEdyYXBoUGluXzQ2NDcnDQogICBQaW5zKDQpPUVkR3JhcGhQaW4nRWRHcmFwaFBpbl80NjQ4Jw0KICAgUGlucyg1KT1FZEdyYXBoUGluJ0VkR3JhcGhQaW5fNDY0OScNCiAgIFBpbnMoNik9RWRHcmFwaFBpbidFZEdyYXBoUGluXzQ2NTAnDQogICBOb2RlUG9zWD0xMTA0DQogICBOb2RlUG9zWT0xNjANCiAgIE5vZGVHdWlkPUM5N0M0RkJDNEI0MkVBOTUyNTNEMjc5ODY5RUUwRkNBDQpFbmQgT2JqZWN0DQpCZWdpbiBPYmplY3QgQ2xhc3M9SzJOb2RlX1RpbWVsaW5lIE5hbWU9IksyTm9kZV9UaW1lbGluZV8xMiINCiAgIEJlZ2luIE9iamVjdCBDbGFzcz1FZEdyYXBoUGluIE5hbWU9IkVkR3JhcGhQaW5fNDY1MSINCiAgIEVuZCBPYmplY3QNCiAgIEJlZ2luIE9iamVjdCBDbGFzcz1FZEdyYXBoUGluIE5hbWU9IkVkR3JhcGhQaW5fNDY1MiINCiAgIEVuZCBPYmplY3QNCiAgIEJlZ2luIE9iamVjdCBDbGFzcz1FZEdyYXBoUGluIE5hbWU9IkVkR3JhcGhQaW5fNDY1MyINCiAgIEVuZCBPYmplY3QNCiAgIEJlZ2luIE9iamVjdCBDbGFzcz1FZEdyYXBoUGluIE5hbWU9IkVkR3JhcGhQaW5fNDY1NCINCiAgIEVuZCBPYmplY3QNCiAgIEJlZ2luIE9iamVjdCBDbGFzcz1FZEdyYXBoUGluIE5hbWU9IkVkR3JhcGhQaW5fNDY1NSINCiAgIEVuZCBPYmplY3QNCiAgIEJlZ2luIE9iamVjdCBDbGFzcz1FZEdyYXBoUGluIE5hbWU9IkVkR3JhcGhQaW5fNDY1NiINCiAgIEVuZCBPYmplY3QNCiAgIEJlZ2luIE9iamVjdCBDbGFzcz1FZEdyYXBoUGluIE5hbWU9IkVkR3JhcGhQaW5fNDY1NyINCiAgIEVuZCBPYmplY3QNCiAgIEJlZ2luIE9iamVjdCBDbGFzcz1FZEdyYXBoUGluIE5hbWU9IkVkR3JhcGhQaW5fNDY1OCINCiAgIEVuZCBPYmplY3QNCiAgIEJlZ2luIE9iamVjdCBDbGFzcz1FZEdyYXBoUGluIE5hbWU9IkVkR3JhcGhQaW5fNDY1OSINCiAgIEVuZCBPYmplY3QNCiAgIEJlZ2luIE9iamVjdCBDbGFzcz1FZEdyYXBoUGluIE5hbWU9IkVkR3JhcGhQaW5fNDY2MCINCiAgIEVuZCBPYmplY3QNCiAgIEJlZ2luIE9iamVjdCBOYW1lPSJFZEdyYXBoUGluXzQ2NTEiDQogICAgICBQaW5OYW1lPSJQbGF5Ig0KICAgICAgUGluVHlwZT0oUGluQ2F0ZWdvcnk9ImV4ZWMiKQ0KICAgRW5kIE9iamVjdA0KICAgQmVnaW4gT2JqZWN0IE5hbWU9IkVkR3JhcGhQaW5fNDY1MiINCiAgICAgIFBpbk5hbWU9IlBsYXlGcm9tU3RhcnQiDQogICAgICBQaW5UeXBlPShQaW5DYXRlZ29yeT0iZXhlYyIpDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgTmFtZT0iRWRHcmFwaFBpbl80NjUzIg0KICAgICAgUGluTmFtZT0iU3RvcCINCiAgICAgIFBpblR5cGU9KFBpbkNhdGVnb3J5PSJleGVjIikNCiAgIEVuZCBPYmplY3QNCiAgIEJlZ2luIE9iamVjdCBOYW1lPSJFZEdyYXBoUGluXzQ2NTQiDQogICAgICBQaW5OYW1lPSJSZXZlcnNlIg0KICAgICAgUGluVHlwZT0oUGluQ2F0ZWdvcnk9ImV4ZWMiKQ0KICAgRW5kIE9iamVjdA0KICAgQmVnaW4gT2JqZWN0IE5hbWU9IkVkR3JhcGhQaW5fNDY1NSINCiAgICAgIFBpbk5hbWU9IlJldmVyc2VGcm9tRW5kIg0KICAgICAgUGluVHlwZT0oUGluQ2F0ZWdvcnk9ImV4ZWMiKQ0KICAgRW5kIE9iamVjdA0KICAgQmVnaW4gT2JqZWN0IE5hbWU9IkVkR3JhcGhQaW5fNDY1NiINCiAgICAgIFBpbk5hbWU9IlVwZGF0ZSINCiAgICAgIERpcmVjdGlvbj1FR1BEX091dHB1dA0KICAgICAgUGluVHlwZT0oUGluQ2F0ZWdvcnk9ImV4ZWMiKQ0KICAgRW5kIE9iamVjdA0KICAgQmVnaW4gT2JqZWN0IE5hbWU9IkVkR3JhcGhQaW5fNDY1NyINCiAgICAgIFBpbk5hbWU9IkZpbmlzaGVkIg0KICAgICAgRGlyZWN0aW9uPUVHUERfT3V0cHV0DQogICAgICBQaW5UeXBlPShQaW5DYXRlZ29yeT0iZXhlYyIpDQogICBFbmQgT2JqZWN0DQogICBCZWdpbiBPYmplY3QgTmFtZT0iRWRHcmFwaFBpbl80NjU4Ig0KICAgICAgUGluTmFtZT0iU2V0TmV3VGltZSINCiAgICAgIFBpblR5cGU9KFBpbkNhdGVnb3J5PSJleGVjIikNCiAgIEVuZCBPYmplY3QNCiAgIEJlZ2luIE9iamVjdCBOYW1lPSJFZEdyYXBoUGluXzQ2NTkiDQogICAgICBQaW5OYW1lPSJOZXdUaW1lIg0KICAgICAgUGluVHlwZT0oUGluQ2F0ZWdvcnk9ImZsb2F0IikNCiAgICAgIERlZmF1bHRWYWx1ZT0iMC4wIg0KICAgICAgQXV0b2dlbmVyYXRlZERlZmF1bHRWYWx1ZT0iMC4wIg0KICAgRW5kIE9iamVjdA0KICAgQmVnaW4gT2JqZWN0IE5hbWU9IkVkR3JhcGhQaW5fNDY2MCINCiAgICAgIFBpbk5hbWU9IkRpcmVjdGlvbiINCiAgICAgIERpcmVjdGlvbj1FR1BEX091dHB1dA0KICAgICAgUGluVHlwZT0oUGluQ2F0ZWdvcnk9ImJ5dGUiLFBpblN1YkNhdGVnb3J5T2JqZWN0PUVudW0nL1NjcmlwdC9FbmdpbmUuVGltZWxpbmVDb21wb25lbnQ6RVRpbWVsaW5lRGlyZWN0aW9uJykNCiAgIEVuZCBPYmplY3QNCiAgIFRpbWVsaW5lTmFtZT0iTXlUaW1lbGluZSINCiAgIFRpbWVsaW5lR3VpZD05Qzk0RUVCNjQ4RUYwQjQyMzUxMEU0OEUwMEFBRjIwOA0KICAgUGlucygwKT1FZEdyYXBoUGluJ0VkR3JhcGhQaW5fNDY1MScNCiAgIFBpbnMoMSk9RWRHcmFwaFBpbidFZEdyYXBoUGluXzQ2NTInDQogICBQaW5zKDIpPUVkR3JhcGhQaW4nRWRHcmFwaFBpbl80NjUzJw0KICAgUGlucygzKT1FZEdyYXBoUGluJ0VkR3JhcGhQaW5fNDY1NCcNCiAgIFBpbnMoNCk9RWRHcmFwaFBpbidFZEdyYXBoUGluXzQ2NTUnDQogICBQaW5zKDUpPUVkR3JhcGhQaW4nRWRHcmFwaFBpbl80NjU2Jw0KICAgUGlucyg2KT1FZEdyYXBoUGluJ0VkR3JhcGhQaW5fNDY1NycNCiAgIFBpbnMoNyk9RWRHcmFwaFBpbidFZEdyYXBoUGluXzQ2NTgnDQogICBQaW5zKDgpPUVkR3JhcGhQaW4nRWRHcmFwaFBpbl80NjU5Jw0KICAgUGlucyg5KT1FZEdyYXBoUGluJ0VkR3JhcGhQaW5fNDY2MCcNCiAgIE5vZGVQb3NYPTYyNA0KICAgTm9kZVBvc1k9MzUyDQogICBiQ2FuUmVuYW1lTm9kZT1UcnVlDQogICBOb2RlR3VpZD1DN0YwODJFNjRCM0MzMjZENUM3MjBCOTg0OTVEQ0YxRA0KRW5kIE9iamVjdA==';
        blueprint = atob(blueprint);
        var parser = new Parser(blueprint);
        while (!parser.isEOF()) {
            var line = parser.line().get();
            if (parser.mode === 0 /* NONE */) {
            }
            if (parser.line().isClassStartTag()) {
                console.log('Node Definition Found!');
                console.log(parser.line().get());
            }
            parser.next();
        }
    }
    ue4viz.parseBlueprint = parseBlueprint;
})(ue4viz || (ue4viz = {}));
//# sourceMappingURL=ue4blueprintviz.js.map