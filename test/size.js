describe("Blueprint Size Calculation:", function() {
    it("singe comment at origin", function() {
        var blueprint = UE4Lib.parseBlueprint(window.__html__['test/bp4.txt']);

        expect(blueprint._data.length).toEqual(1);
    });

    it("single comment negative origin", function() {
        var blueprint = UE4Lib.parseBlueprint(window.__html__['test/bp4.txt']);

        expect(blueprint._data.length).toEqual(1);
    });

    it("singe comment positive origin", function() {
        var blueprint = UE4Lib.parseBlueprint(window.__html__['test/bp4.txt']);

        expect(blueprint._data.length).toEqual(1);
    });

    it("2 comments", function() {
        var blueprint = UE4Lib.parseBlueprint(window.__html__['test/bp4.txt']);

        expect(blueprint._data.length).toEqual(1);
    });

    it("1 negativ comment 1 positive node", function() {
        var blueprint = UE4Lib.parseBlueprint(window.__html__['test/bp4.txt']);

        expect(blueprint._data.length).toEqual(1);
    });
});
