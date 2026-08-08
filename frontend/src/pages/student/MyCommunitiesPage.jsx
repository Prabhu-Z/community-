import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import CommunityDetailModal from '../../components/common/CommunityDetailModal';
import { Users, Sparkles, Building2, Eye } from 'lucide-react';

const MyCommunitiesPage = () => {
  const { user } = useAuth();
  const [myMemberships, setMyMemberships] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Roster Detail Modal State
  const [detailModal, setDetailModal] = useState(false);
  const [activeCommunity, setActiveCommunity] = useState(null);

  useEffect(() => {
    fetchMyCommunities();
  }, [user]);

  const fetchMyCommunities = async () => {
    if (!user?.studentId) {
      setLoading(false);
      return;
    }
    try {
      const [memRes, commRes] = await Promise.all([
        api.get(`/students/${user.studentId}/communities`),
        api.get('/communities'),
      ]);

      // Filter ONLY APPROVED memberships
      const approvedMemberships = (memRes.data || []).filter(
        (m) => m.status === 'APPROVED' || m.status === 'ACTIVE'
      );

      setMyMemberships(approvedMemberships);
      setCommunities(commRes.data || []);
    } catch (err) {
      console.error('Error fetching student joined communities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRosterModal = (communityId, communityName, category, facultyCoord, studentCoord, description) => {
    const fullComm = communities.find((c) => c.id === communityId) || {
      id: communityId,
      name: communityName,
      category: category,
      facultyCoordinator: facultyCoord,
      studentCoordinator: studentCoord,
      description: description || 'Accepted member of college community chapter.',
      status: 'ACTIVE',
    };

    setActiveCommunity(fullComm);
    setDetailModal(true);
  };

  if (loading) return <LoadingSpinner label="Loading your accepted communities & member rosters..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#8b5cf6]" /> Official Chapter Membership
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">My Joined Communities</h1>
          <p className="text-xs text-slate-600 mt-1">
            College communities where your membership application has been accepted by community coordinators.
          </p>
        </div>
      </div>

      {/* Joined Communities Cards Grid */}
      {myMemberships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myMemberships.map((m) => {
            const matchedComm = communities.find((c) => c.id === m.communityId);
            const facultyLead = matchedComm?.facultyCoordinator || 'Dr. Admin Lead';
            const studentLead = matchedComm?.studentCoordinator || 'Faculty Head';

            return (
              <div
                key={m.id}
                onClick={() =>
                  handleOpenRosterModal(
                    m.communityId,
                    m.communityName,
                    m.communityCategory,
                    facultyLead,
                    studentLead,
                    matchedComm?.description
                  )
                }
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-[#8b5cf6]/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-[#7c3aed] border border-purple-200">
                      {m.communityCategory}
                    </span>
                    <Badge status={m.status}>APPROVED MEMBER</Badge>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#7c3aed] transition-colors flex items-center justify-between">
                    <span>{m.communityName}</span>
                    <Eye className="w-4 h-4 text-[#8b5cf6] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>

                  <div className="text-[11px] font-mono text-[#7c3aed] font-bold">
                    Role in Community: <strong className="text-slate-800">{m.role || 'MEMBER'}</strong>
                  </div>

                  {/* Staff & Coordinators Preview */}
                  <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Faculty Advisor:</span>
                      <strong className="text-slate-800 font-bold">{facultyLead}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Faculty Head:</span>
                      <strong className="text-slate-800 font-bold">{studentLead}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-[#8b5cf6] border border-purple-200 hover:border-[#8b5cf6] text-[#7c3aed] hover:text-[#7c3aed] font-bold text-xs flex items-center justify-center gap-2 transition">
                    <Users className="w-4 h-4" /> View Coordinators & All Members Roster
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Accepted Community Memberships Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Once your membership application is accepted by a community coordinator, your joined community will appear here with its full coordinator leadership and member roster.
          </p>
        </div>
      )}

      {/* Community Detail & Full Roster Modal */}
      <CommunityDetailModal
        isOpen={detailModal}
        onClose={() => setDetailModal(false)}
        community={activeCommunity}
      />
    </div>
  );
};

export default MyCommunitiesPage;
