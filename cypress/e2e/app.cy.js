describe('Video Sync Application', () => {
    
    it('loads the application and displays the UI channels', () => {
        cy.visit('/');

        cy.get('#sync-video')
          .should('exist')
          .and('have.prop', 'muted', true);
    });

    it('fetches and displays the weather successfully', () => {
        cy.visit('/');

        cy.get('#temperature-display').should('contain', 'Loading...');

        cy.get('#temperature-display', { timeout: 10000 }).should('contain', '°C');
    });

    it('plays the video when interacted with', () => {
        cy.visit('/');

        cy.get('#sync-video').then(($video) => {
            $video[0].play();
        });

        cy.get('#sync-video').should(($video) => {
            expect($video[0].paused).to.be.false;
        });
    });
});