import { NextRequest } from 'next/server';
import connectDB from './mongodb';
import AuditLog from '@/models/AuditLog';

interface AuditLogParams {
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  userEmail?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  request?: NextRequest;
}

export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    await connectDB();
    
    const ipAddress = params.request?.headers.get('x-forwarded-for') || 
                     params.request?.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = params.request?.headers.get('user-agent') || 'unknown';

    await AuditLog.create({
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      userId: params.userId,
      userEmail: params.userEmail,
      changes: params.changes,
      metadata: params.metadata,
      ipAddress: ipAddress.toString(),
      userAgent,
    });
  } catch (error) {
    // Don't throw - audit logging should not break the main flow
    console.error('Audit log error:', error);
  }
}


