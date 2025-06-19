import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ClubContext = createContext(null);

export const ClubProvider = ({ children }) => {
    const { user } = useAuth();
    const [currentClub, setCurrentClub] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadClub = async () => {
            try {
                if (user) {
                    // Pour l'instant, on utilise le club principal de l'utilisateur
                    // Plus tard, on pourra ajouter la logique pour changer de club
                    const primaryClub = {
                        id: user.primaryClubId,
                        name: user.primaryClubName
                    };
                    setCurrentClub(primaryClub);
                }
            } catch (error) {
                console.error('Erreur lors du chargement du club:', error);
            } finally {
                setLoading(false);
            }
        };

        loadClub();
    }, [user]);

    const switchClub = (club) => {
        setCurrentClub(club);
    };

    if (loading) {
        return <div>Chargement du club...</div>;
    }

    return (
        <ClubContext.Provider value={{ currentClub, switchClub }}>
            {children}
        </ClubContext.Provider>
    );
};

export const useClub = () => {
    const context = useContext(ClubContext);
    if (!context) {
        throw new Error('useClub must be used within a ClubProvider');
    }
    return context;
}; 