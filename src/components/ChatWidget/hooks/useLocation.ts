import { useState, useEffect } from 'react';
import type { Lead } from '../../../types';

export function useLocation() {
  const fetchLocation = async () => {
    try {
      const services = [
        'https://ipapi.co/json/',
        'https://api.ipify.org?format=json'
      ];

      let locationData = {};

      for (const service of services) {
        try {
          const response = await fetch(service);
          if (!response.ok) continue;

          const data = await response.json();
          
          if (service.includes('ipapi.co')) {
            if (!data.error) {
              locationData = {
                city: data.city || '',
                country: data.country_name || '',
                region: data.region || '',
                ip: data.ip || ''
              };
              break;
            }
          } else if (service.includes('ipify.org')) {
            locationData = {
              ip: data.ip || ''
            };
            break;
          }
        } catch (error) {
          console.warn(`Failed to fetch from ${service}:`, error);
          continue;
        }
      }

      return locationData;
    } catch (error) {
      console.warn('Location fetch failed:', error);
      return {};
    }
  };

  return { fetchLocation };
}