import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { CreatePostPage as CreatePostForm } from '../components/CreatePostPage';

export function CreatePostPage() {
    return (
        <DashboardLayout>
            <CreatePostForm />
        </DashboardLayout>
    );
}
