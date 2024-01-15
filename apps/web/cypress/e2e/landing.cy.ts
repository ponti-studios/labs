describe("landing flow", () => {
  it("should load", () => {
    cy.visit("http://localhost:5001");
    cy.contains("Make the world yours").should("be.visible");
  });
});
