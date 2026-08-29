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
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);

export const StatePage = () => (
    <MasterPage 
        moduleName="State" 
        columns={['Emirate Name', 'Status']} 
        fields={[
            { name: 'name', label: 'Emirate Name', type: 'text' },
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);

export const EmiratePage = StatePage;

export const CityPage = () => (
    <MasterPage 
        moduleName="City" 
        columns={['City Name', 'Emirate', 'Status']} 
        fields={[
            { name: 'name', label: 'City Name', type: 'text' },
            { name: 'state', label: 'Emirate', type: 'dropdown' },
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);

export const ServicePage = () => (
    <MasterPage 
        moduleName="Service" 
        columns={['S.No', 'Name', 'Price', 'Status']} 
        fields={[
            { name: 'displayOrder', label: 'Display Order / Sequence', type: 'number' },
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'image', label: 'Image', type: 'text' },
            { name: 'price', label: 'Price', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'isInstant', label: 'Instant Service', type: 'toggle' },
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);

export const SubServicePage = () => (
    <MasterPage 
        moduleName="subservice" 
        columns={['Name', 'Parent Service', 'Price', 'Status']} 
        fields={[
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'serviceId', label: 'Service ID', type: 'dropdown' },
            { name: 'price', label: 'Price', type: 'text' },
            { name: 'description', label: 'Description', type: 'string_array' },
            { name: 'duration', label: 'Duration (in mins)', type: 'text' },
            { name: 'image', label: 'Image', type: 'text' },
            { name: 'isInstant', label: 'Instant Service', type: 'toggle' },
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);

export const BrandPage = () => (
    <MasterPage 
        moduleName="Brand" 
        columns={['Name', 'Model', 'Status']} 
        fields={[
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'model', label: 'Model', type: 'text' },
            { name: 'image', label: 'Image URL', type: 'text' },
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);

export const ColorPage = () => (
    <MasterPage 
        moduleName="Color" 
        columns={['Color Name', 'Status']} 
        fields={[
            { name: 'name', label: 'Color Name', type: 'text' },
            { name: 'image', label: 'Image URL', type: 'text' },
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);

export const MakePage = () => (
    <MasterPage 
        moduleName="Make" 
        columns={['Name', 'Status']} 
        fields={[
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'code', label: 'Code', type: 'text' },
            { name: 'image', label: 'Image URL', type: 'text' },
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);

export const ModelPage = () => (
    <MasterPage 
        moduleName="Model" 
        columns={['Model Name', 'Brand', 'Status']} 
        fields={[
            { name: 'name', label: 'Model Name', type: 'text' },
            { name: 'makeId', label: 'Brand', type: 'dropdown' },
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);

export const VehicleTypePage = () => (
    <MasterPage 
        moduleName="VehicleType" 
        columns={['Name', 'Status']} 
        fields={[
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'code', label: 'Code', type: 'text' },
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);

export const BannerPage = () => (
    <MasterPage 
        moduleName="Banner" 
        columns={['Title', 'Type', 'Position', 'Status']} 
        fields={[
            { name: 'title', label: 'Title', type: 'text' },
            { 
              name: 'type', 
              label: 'Banner Type', 
              type: 'dropdown', 
              options: [
                { label: 'User', value: 'user' },
                { label: 'Agent', value: 'agent' }
              ] 
            },
            { name: 'position', label: 'Position', type: 'number' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'image', label: 'Image', type: 'text' },
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);

export const FuelTypePage = () => (
    <MasterPage 
        moduleName="FuelType" 
        columns={['Name', 'Status']} 
        fields={[
            { name: 'name', label: 'Fuel Type Name', type: 'text' },
            { name: 'code', label: 'Code', type: 'text' },
            { name: 'status', label: 'Status', type: 'toggle' }
        ]} 
    />
);
