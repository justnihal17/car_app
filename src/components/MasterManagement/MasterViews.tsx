import { MasterPage } from './MasterPage';

export const RolePage = () => (
    <MasterPage 
        moduleName="Role" 
        columns={['Role Name', 'Status']} 
        fields={[
            { name: 'name', label: 'Role Name', type: 'text' },
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);

export const SkillPage = () => (
    <MasterPage 
        moduleName="Skill" 
        columns={['Skill Name', 'Status']} 
        fields={[
            { name: 'name', label: 'Skill Name', type: 'text' },
            { name: 'category', label: 'Category', type: 'dropdown', options: ['General', 'Technical', 'Safety'] },
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);

export const StatePage = () => (
    <MasterPage 
        moduleName="State" 
        columns={['State Name', 'Status']} 
        fields={[
            { name: 'name', label: 'State Name', type: 'text' },
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);

export const CityPage = () => (
    <MasterPage 
        moduleName="City" 
        columns={['City Name', 'Status']} 
        fields={[
            { name: 'name', label: 'City Name', type: 'text' },
            { name: 'state', label: 'State', type: 'dropdown', options: ['State 1', 'State 2'] },
            { name: 'pincode', label: 'Pincode', type: 'text' },
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);

export const ServicePage = () => (
    <MasterPage 
        moduleName="Service" 
        columns={['Service Name', 'Category', 'Price', 'Status']} 
        fields={[
            { name: 'name', label: 'Service Name', type: 'text' },
            { name: 'category', label: 'Category', type: 'dropdown', options: ['Repair', 'Maintenance', 'Consultation'] },
            { name: 'price', label: 'Price', type: 'number' },
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);

