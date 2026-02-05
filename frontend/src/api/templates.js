// src/api/templates.js

// NOTE: Currently using dummy data (no backend calls)

let dummyTemplates = [
    {
        id: 'tpl_ecom_confirm_order',
        name: 'Ecom Order Confirmation',
        category: 'Utility',
        language: 'en_US',
        status: 'Approved',
        body: 'Hi {{1}}, your order {{2}} has been confirmed!',
        variables: ['Customer Name', 'Order ID'],
        previews: ['Hi John, your order #12345 has been confirmed!'],
        performance: {
            sent: 1200, delivered: 1180, read: 950, readRate: '80%',
            impressions: 1500, clicks: 300, ctr: '20%'
        },
        createdAt: '2023-01-15T10:00:00Z',
        updatedAt: '2023-01-15T10:00:00Z',
    },
    // ...rest unchanged
];

const templateService = {
    getAllTemplates: async (page = 1, limit = 10, search = '') => {
        await new Promise(resolve => setTimeout(resolve, 500));

        let filteredTemplates = dummyTemplates;
        if (search) {
            filteredTemplates = dummyTemplates.filter(tpl =>
                tpl.name.toLowerCase().includes(search.toLowerCase()) ||
                tpl.id.toLowerCase().includes(search.toLowerCase()) ||
                tpl.category.toLowerCase().includes(search.toLowerCase())
            );
        }

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        return {
            templates: filteredTemplates.slice(startIndex, endIndex),
            total: filteredTemplates.length,
            page,
            limit,
        };
    },

    getTemplateById: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const template = dummyTemplates.find(tpl => tpl.id === id);
        if (!template) throw new Error('Template not found');
        return template;
    },

    createTemplate: async (templateData) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newTemplate = {
            id: `tpl_${Date.now()}`,
            ...templateData,
            status: 'Pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            performance: {
                sent: 0, delivered: 0, read: 0,
                readRate: '0%', impressions: 0, clicks: 0, ctr: '0%'
            }
        };
        dummyTemplates.push(newTemplate);
        return newTemplate;
    },

    updateTemplate: async (id, templateData) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = dummyTemplates.findIndex(tpl => tpl.id === id);
        if (index === -1) throw new Error('Template not found');

        dummyTemplates[index] = {
            ...dummyTemplates[index],
            ...templateData,
            updatedAt: new Date().toISOString()
        };
        return dummyTemplates[index];
    },

    deleteTemplate: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const before = dummyTemplates.length;
        dummyTemplates = dummyTemplates.filter(tpl => tpl.id !== id);
        if (dummyTemplates.length === before) {
            throw new Error('Template not found');
        }
        return { message: 'Template deleted successfully' };
    }
};

export default templateService;
