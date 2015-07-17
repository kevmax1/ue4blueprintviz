module UE4Lib{
    export function drawBlueprint(blueprint): void{
        //todo
        console.dir(getSize(blueprint));

        /*blueprint.forEach(function(node){
            var type = Object.keys(node)[0];
            if(type === 'EdGraphNode_Comment'){
                console.debug('found comment');
            }
        });*/
    }

    function getSize(blueprint): {} {
        var minX = 0;
        var minY = 0;
        var maxX = 0;
        var maxY = 0;
        var paddingX = 200;
        var paddingY = 200;

        console.time('getSize');
        blueprint.forEach(function(node){
            node = node[Object.keys(node)[0]];

            if('NodePosX' in node && 'NodePosY' in node){
                if(isNaN(node.NodePosX))
                    console.error(node.NodePosX);
                else if(isNaN(node.NodePosY))
                    console.error(node.NodePosY);


                if('NodeWidth' in node && 'NodeHeight' in node){
                    if(isNaN(node.NodeWidth))
                        console.error(node.NodeWidth);
                    else if(isNaN(node.NodeHeight))
                        console.error(node.NodeHeight);

                    if(node.NodePosX < minX)
                        minX = node.NodePosX;
                    if(node.NodePosY < minY)
                        minY = node.nodePosY;

                    if(node.NodePosX > maxX)
                        maxX = node.NodeWidth + node.NodePosX;
                    if(node.NodePosY > maxY)
                        maxY = node.NodeHeight + node.NodePosY;
                }
                else{
                    if(node.NodePosX < minX)
                        minX = node.NodePosX;
                    if(node.NodePosY < minY)
                        minY = node.nodePosY;

                    if(node.NodePosX > maxX)
                        maxX = node.NodePosX;
                    if(node.NodePosY > maxY)
                        maxY = node.NodePosY;
                }
            }
        });
        console.timeEnd('getSize');

        return {
            height: Math.abs(minY) + Math.abs(maxY) + paddingY,
            width: Math.abs(minX) + Math.abs(maxX) + paddingX
        }
    }
}
