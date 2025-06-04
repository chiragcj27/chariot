export const menuData: Record<string, {
    subcategories: Array<{
      id: string;
      name: string;
      items: Array<{
        id: string;
        name: string;
      }>;
    }>;
    featured: Array<{
      id: string;
      name: string;
      price: string;
      image: string;
    }>;
  }> = {
    'marketing-sales': {
      subcategories: [
        {
          id: 'print-marketing',
          name: 'Print Marketing',
          items: [
            { id: 'catalogs', name: 'Catalogs' },
            { id: 'brochures', name: 'Brochures' },
            { id: 'flyers', name: 'Flyers' },
            { id: 'leaflets', name: 'Leaflets' }
          ]
        },
        {
          id: 'digital',
          name: 'Digital Marketing',
          items: [
            { id: 'social', name: 'Social Media' },
            { id: 'email', name: 'Email Marketing' },
            { id: 'website', name: 'Website Content' },
            { id: 'seo', name: 'SEO' },
            { id: 'advertising', name: 'Online Advertising' }
          ]
        },
        {
          id: 'promotional',
          name: 'Promotional Material',
          items: [
            { id: 'gift-certificates', name: 'Gift Certificates' },
            { id: 'posters', name: 'Posters' },
            { id: 'duratrans', name: 'Duratrans' },
            { id: 'window-clings', name: 'Window Clings' },
            { id: 'danglers', name: 'Danglers' }
          ]
        },
        {
          id: 'photography',
          name: 'Photography',
          items: [
            { id: 'product', name: 'Product Photography' },
            { id: 'lifestyle', name: 'Lifestyle Photography' },
            { id: 'videos', name: 'Videos' }
          ]
        }
      ],
      featured: [
        {
          id: 'feature-1',
          name: 'Diamond Engagement Ring',
          price: '$2,499',
          image: 'https://images.pexels.com/photos/2735970/pexels-photo-2735970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        {
          id: 'feature-2',
          name: 'Gold Statement Necklace',
          price: '$1,299',
          image: 'https://images.pexels.com/photos/10872538/pexels-photo-10872538.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        }
      ]
    },
    'design': {
      subcategories: [
        {
          id: 'jewelry-design',
          name: 'Jewelry Design',
          items: [
            { id: 'sketches', name: 'Sketches' },
            { id: 'renders', name: 'Renders' },
            { id: 'cad', name: 'CAD Design' },
            { id: '3d', name: '3D Modeling' }
          ]
        },
        {
          id: 'marketing-material',
          name: 'Marketing Material Design',
          items: [
            { id: 'ads', name: 'Ads' },
            { id: 'social-graphics', name: 'Social Media Graphics' },
            { id: 'banners', name: 'Website Banners' }
          ]
        },
        {
          id: 'packaging',
          name: 'Packaging Design',
          items: [
            { id: 'boxes', name: 'Boxes' },
            { id: 'bags', name: 'Bags' },
            { id: 'pouch', name: 'Pouch' },
            { id: 'labels', name: 'Labels' },
            { id: 'custom-box', name: 'Custom Box' }
          ]
        },
        {
          id: 'display',
          name: 'Display Design',
          items: [
            { id: 'window', name: 'Window Display Concepts' },
            { id: 'in-store', name: 'In-store Display Layouts' },
            { id: 'signage', name: 'Signage & Graphics' }
          ]
        }
      ],
      featured: [
        {
          id: 'feature-3',
          name: 'Sapphire Earrings',
          price: '$1,899',
          image: 'https://images.pexels.com/photos/1438243/pexels-photo-1438243.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        {
          id: 'feature-4',
          name: 'Pearl Bracelet',
          price: '$899',
          image: 'https://images.pexels.com/photos/9428868/pexels-photo-9428868.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        }
      ]
    },
    'pos': {
      subcategories: [
        {
          id: 'display',
          name: 'Display Solutions',
          items: [
            { id: 'trays', name: 'Trays' },
            { id: 'travel', name: 'Travel Organisers' },
            { id: 'program', name: 'Program Displays' }
          ]
        },
        {
          id: 'materials',
          name: 'POS Materials',
          items: [
            { id: 'counter', name: 'Counter Displays' },
            { id: 'signage', name: 'Signage' },
            { id: 'training', name: 'Sales Training Material' }
          ]
        }
      ],
      featured: [
        {
          id: 'feature-5',
          name: 'Ruby Pendant',
          price: '$1,499',
          image: 'https://images.pexels.com/photos/10533030/pexels-photo-10533030.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        {
          id: 'feature-6',
          name: 'Men\'s Watch',
          price: '$2,999',
          image: 'https://images.pexels.com/photos/9607249/pexels-photo-9607249.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        }
      ]
    },
    'branding': {
      subcategories: [
        {
          id: 'brand-dev',
          name: 'Brand Development',
          items: [
            { id: 'logo', name: 'Logo Designs' },
            { id: 'guidelines', name: 'Brand Guidelines' }
          ]
        },
        {
          id: 'collateral',
          name: 'Brand Collaterals',
          items: [
            { id: 'business-cards', name: 'Business Cards & Stationery' },
            { id: 'website', name: 'Website Design' },
            { id: 'email', name: 'Email Signature Design' },
            { id: 'swag', name: 'SWAG' }
          ]
        }
      ],
      featured: [
        {
          id: 'feature-7',
          name: 'Diamond Studs',
          price: '$999',
          image: 'https://images.pexels.com/photos/12929510/pexels-photo-12929510.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        {
          id: 'feature-8',
          name: 'Gold Chain',
          price: '$1,299',
          image: 'https://images.pexels.com/photos/10017559/pexels-photo-10017559.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        }
      ]
    },
    'collections': {
      subcategories: [
        {
          id: 'seasonal',
          name: 'Seasonal Collections',
          items: [
            { id: 'summer', name: 'Summer Radiance' },
            { id: 'winter', name: 'Winter Frost' },
            { id: 'spring', name: 'Spring Bloom' }
          ]
        },
        {
          id: 'signature',
          name: 'Signature Collections',
          items: [
            { id: 'eternity', name: 'Eternity' },
            { id: 'celestial', name: 'Celestial' },
            { id: 'heritage', name: 'Heritage' }
          ]
        }
      ],
      featured: [
        {
          id: 'feature-9',
          name: 'Emerald Ring',
          price: '$3,499',
          image: 'https://images.pexels.com/photos/12067937/pexels-photo-12067937.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        {
          id: 'feature-10',
          name: 'Diamond Bangle',
          price: '$2,199',
          image: 'https://images.pexels.com/photos/1327686/pexels-photo-1327686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        }
      ]
    },
    'about': {
      subcategories: [
        {
          id: 'company',
          name: 'Our Company',
          items: [
            { id: 'story', name: 'Our Story' },
            { id: 'craftmanship', name: 'Craftmanship' },
            { id: 'sustainability', name: 'Sustainability' }
          ]
        },
        {
          id: 'services',
          name: 'Services',
          items: [
            { id: 'custom', name: 'Custom Design' },
            { id: 'repair', name: 'Repair & Maintenance' },
            { id: 'appraisal', name: 'Appraisal' }
          ]
        }
      ],
      featured: [
        {
          id: 'feature-11',
          name: 'Luxury Watch',
          price: '$5,999',
          image: 'https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        {
          id: 'feature-12',
          name: 'Custom Ring Design',
          price: 'From $2,499',
          image: 'https://images.pexels.com/photos/1616096/pexels-photo-1616096.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        }
      ]
    }
  };