describe("Tests:", function() {
    it("Parse Blueprint Markup", function() {
        var blueprint = UE4Lib.parseBlueprint(window.__html__['test/bp4.txt']);

        expect(blueprint._data.length).toEqual(1);
    });
});
