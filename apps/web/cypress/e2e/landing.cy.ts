describe("landing flow", () => {
  it("should load", () => {
    cy.visit("http://localhost:5001");
    cy.contains("the world is yours").should("be.visible");
  });
});
