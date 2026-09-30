import { createClient } from "@/lib/supabase/server";
import { mockDb } from "@/lib/mock-db";
import { TeamMember } from "@/types/project";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function TeamPage({ params }: { params: { id: string } }) {
  let team: TeamMember[] = [];
  let error: string | null = null;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      team = mockDb.getTeamMembers(params.id);
    } else {
      const supabase = createClient();
      const { data, error: dbErr } = await supabase
        .from('team_members')
        .select('*')
        .eq('project_id', params.id)
        .order('name', { ascending: true });
        
      if (dbErr) throw dbErr;
      team = data as TeamMember[];
    }
  } catch {
    error = "Unable to load project team members.";
  }

  if (error) {
    return (
      <Card className="border-rose-200 bg-rose-50/50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-rose-600">
          <p className="font-medium">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900">Team Members</h2>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {team.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search team members..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      )}

      {team.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No team members assigned yet.</h3>
            <p className="text-slate-500 mb-4 max-w-sm">
              Add team members to assign tasks, manage workload, and collaborate.
            </p>
            <Button variant="outline">Add team member</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map(member => (
            <Card key={member.id} className="border-slate-200 shadow-sm">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-slate-900 truncate">{member.name}</h3>
                    {member.status === 'ACTIVE' 
                      ? <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                      : <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-500 border-slate-200">Inactive</Badge>
                    }
                  </div>
                  <p className="text-sm text-slate-500 truncate mt-0.5">{member.role}</p>
                  
                  {member.responsibility && (
                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                      {member.responsibility}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
