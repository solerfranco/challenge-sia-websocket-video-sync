describe('Video Sync Application', () => {
    
    it('loads the application and displays the UI channels', () => {
        cy.visit('/');

        cy.get('#sync-video')
          .should('exist')
          .and('have.prop', 'muted', true);
    });

    it('fetches and displays the weather successfully', () => {
        cy.visit('/');
        
        cy.get('.weather-widget__loading').should('be.visible');
        
        cy.get('.weather-widget__temperature', { timeout: 10000 }).should('contain', '°C');
        cy.get('#temperature-display').should('not.have.text', '-');
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