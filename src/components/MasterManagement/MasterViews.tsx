import { MasterPage } from './MasterPage';

export const RolePage = () => (
    <MasterPage 
        moduleName="Role" 
        columns={['ID', 'Role Name', 'Status']} 
        fields={[
            { name: 'name', label: 'Role Name', type: 'text' },
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);

export const SkillPage = () => (
    <MasterPage 
        moduleName="Skill" 
        columns={['ID', 'Skill Name', 'Status']} 
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
        columns={['ID', 'State Name', 'Status']} 
        fields={[
            { name: 'name', label: 'State Name', type: 'text' },
            { name: 'country', label: 'Country', type: 'dropdown', options: ['UAE', 'India', 'Saudi Arabia'] },
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);

export const CityPage = () => (
    <MasterPage 
        moduleName="City" 
        columns={['ID', 'City Name', 'Status']} 
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
        columns={['ID', 'Service Name', 'Category', 'Status']} 
        fields={[
            { name: 'name', label: 'Service Name', type: 'text' },
            { name: 'category', label: 'Category', type: 'dropdown', options: ['Repair', 'Maintenance', 'Consultation'] },
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);

