describe("landing flow", () => {
	it("should load", () => {
		cy.visit("http://localhost:53422");
		cy.contains("The world is finally yours").should("be.visible");
	});
});
