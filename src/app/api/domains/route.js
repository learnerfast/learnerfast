import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    if (!siteId) {
      return NextResponse.json({ error: 'Site ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('custom_domains')
      .select('*, dns_records(*)')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ domains: data });
  } catch (error) {
    console.error('Get domains error:', error);
    return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { siteId, domain } = await request.json();

    if (!siteId || !domain) {
      return NextResponse.json({ error: 'Site ID and domain required' }, { status: 400 });
    }

    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
    if (!domainRegex.test(domain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('custom_domains')
      .select('id')
      .eq('domain', domain)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Domain already in use' }, { status: 409 });
    }

    const { data: newDomain, error } = await supabase
      .from('custom_domains')
      .insert({
        site_id: siteId,
        domain: domain,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    const dnsRecords = [
      {
        domain_id: newDomain.id,
        record_type: 'TXT',
        name: '_learnerfast-verification',
        value: newDomain.verification_token
      },
      {
        domain_id: newDomain.id,
        record_type: 'CNAME',
        name: domain,
        value: 'learnerfast.com'
      }
    ];

    await supabase.from('dns_records').insert(dnsRecords);

    return NextResponse.json({ domain: newDomain, dnsRecords });
  } catch (error) {
    console.error('Add domain error:', error);
    return NextResponse.json({ error: 'Failed to add domain' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get('id');

    if (!domainId) {
      return NextResponse.json({ error: 'Domain ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('custom_domains')
      .delete()
      .eq('id', domainId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete domain error:', error);
    return NextResponse.json({ error: 'Failed to delete domain' }, { status: 500 });
  }
}
