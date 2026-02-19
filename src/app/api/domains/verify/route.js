import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import dns from 'dns/promises';

export async function POST(request) {
  try {
    const { domainId } = await request.json();

    if (!domainId) {
      return NextResponse.json({ error: 'Domain ID required' }, { status: 400 });
    }

    const { data: domain, error: domainError } = await supabase
      .from('custom_domains')
      .select('*, dns_records(*)')
      .eq('id', domainId)
      .single();

    if (domainError || !domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    const txtRecord = domain.dns_records.find(r => r.record_type === 'TXT');
    if (!txtRecord) {
      return NextResponse.json({ error: 'Verification record not found' }, { status: 404 });
    }

    try {
      const records = await dns.resolveTxt(`_learnerfast-verification.${domain.domain}`);
      const verified = records.some(record => 
        record.join('').includes(domain.verification_token)
      );

      if (verified) {
        await supabase
          .from('custom_domains')
          .update({
            status: 'verified',
            verified_at: new Date().toISOString()
          })
          .eq('id', domainId);

        await supabase
          .from('dns_records')
          .update({ verified: true, verified_at: new Date().toISOString() })
          .eq('id', txtRecord.id);

        return NextResponse.json({ 
          verified: true, 
          message: 'Domain verified successfully' 
        });
      } else {
        return NextResponse.json({ 
          verified: false, 
          message: 'Verification record not found. Please check your DNS settings.' 
        });
      }
    } catch (dnsError) {
      return NextResponse.json({ 
        verified: false, 
        message: 'DNS lookup failed. Please ensure DNS records are properly configured.' 
      });
    }
  } catch (error) {
    console.error('Verify domain error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
