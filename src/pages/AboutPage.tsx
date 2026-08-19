import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { H1, H2, H3, Body } from '../components/common/Typography';
import Button from '../components/common/Button';

import heroImage from '@img/3943474de3cacbeadcd921662ef36656d7b2740e.jpg';
import communityImage from '@img/b3f887ea2c439857b8501264d689869cf54fd421.png';
import neighbourhoodImage from '@img/af432de379ac10cea142202121cefffd5457157e.png';
import localImage from '@img/fa0f8a56b19d70afad2601dab96005bee78e6451.png';
import sceneImage1 from '@img/5f5064b20e73e98611517a7211ef41b6b55ef53e.png';
import AccessibleIcon from '@img/Accessible.png';
import StructuredIcon from '@img/Structured.png';
import ActionableIcon from '@img/Actionable.png';
import FedericoImage from '@img/CEO.png';
import YuliiaImage from '@img/COO.png';
import MichaelImage from '@img/Designer.png';
import IrinaImage from '@img/UX UI Designer.png';
import TereseImage from '@img/UI Disigner.png';
import AlamkheerImage from '@img/Software Engineer.png';
import SteveImage from '@img/Software Engineer.jpg';
import MubtasinImage from '@img/Data Engineer.png';
import FrederickImage from '@img/Data engineer.jpg';
import JoyImage from '@img/Project Manger.png';

const FAQ_ITEMS = [
  {
    question: 'What is RoomReview?',
    answer:
      'RoomReview is a property intelligence platform that helps people understand postcodes, neighbourhoods and properties before renting, buying or investing. We combine trusted public data with local insights to provide a clearer picture of an area.',
  },
  {
    question: 'Where does your data come from?',
    answer:
      'Our insights are built using trusted public datasets from recognised organisations, alongside community-contributed information and local intelligence. We continuously review and update our data sources to improve accuracy and relevance.',
  },
  {
    question: 'Can I trust the information on RoomReview?',
    answer:
      'Transparency is central to our mission. We use recognised public data sources, apply a consistent methodology and moderate community contributions to help ensure quality and reliability.',
  },
  {
    question: 'Can I contribute to RoomReview?',
    answer:
      'Yes. RoomReview is designed to benefit from local knowledge and community input, so users can share experiences, report issues and help other people make smarter housing decisions.',
  },
  {
    question: 'How are RoomReview scores calculated?',
    answer:
      'Our scores combine multiple indicators including local crime, transport access, housing demand and community feedback. Scores are updated regularly to reflect changes in the local area.',
  },
];

const contributors = [
  {
    name: 'Federico Grosso',
    role: 'Co-founder, CEO',
    image: FedericoImage,
  },
  {
    name: 'Yuliia Mosiakova',
    role: 'Co-founder, COO',
    image: YuliiaImage,
  },
];

const team = [
  {
    name: 'Michael McGuigan',
    role: 'UX/UI Designer',
    image: MichaelImage,
  },
  {
    name: 'Irina Pak',
    role: 'UX/UI Designer',
    image: IrinaImage,
  },
  {
    name: 'Terese Christiansen',
    role: 'UX/UI Designer',
    image: TereseImage,
  },
  {
    name: 'Alamkheer Husainul Fareedh M.',
    role: 'Software Engineer',
    image: AlamkheerImage,
  },
  {
    name: 'Steve Hiscox',
    role: 'Software Engineer',
    image: SteveImage,
  },
  {
    name: 'Mubtasin Quader',
    role: 'Data Engineer',
    image: MubtasinImage,
  },
  {
    name: 'Frederick Elledge',
    role: 'Data Engineer',
    image: FrederickImage,
  },
  {
    name: 'Joy Onyesom',
    role: 'Project Manager',
    image: JoyImage,
  },
];

const AboutPage = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="bg-white text-[#1A2B3C]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] items-center">
          <div className="space-y-8">
            <div>
              <H1 className="text-[3.5rem] leading-[1.02] tracking-[-0.04em] max-w-3xl">
                Built to make property decisions safer, clearer and more informed.
              </H1>
            </div>

            <Body className="max-w-2xl text-[#0B0B0B] leading-8 text-lg">
              RoomReview helps people understand a postcode, area or property before making one of life’s biggest decisions — where to live, rent, buy or invest.
            </Body>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/area-search" className="inline-flex">
                <Button variant="primary" size="lg">
                  Explore RoomReview
                </Button>
              </Link>
              <Link to="/postcode-search" className="inline-flex">
                <Button variant="secondary" size="lg">
                  Join Early Access
                </Button>
              </Link>
            </div>
          </div>
          <div className="rounded-[36px] overflow-hidden shadow-[0_40px_80px_rgba(20,22,33,0.08)] border border-[#EFE9E3]">
            <img
              src={heroImage}
              alt="Street view"
              className="w-full h-[520px] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">
        <div className="space-y-16">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] items-center">
            <div className="space-y-6">
              <H2 className="text-[#1A2B3C] font-bold text-4xl">Our story</H2>
              <p className="text-[#1A2B3C] font-semibold text-lg max-w-2xl">
                RoomReview was born from a personal experience that exposed a much bigger problem.
              </p>
              <Body className="text-[#0B0B0B] leading-8 text-lg max-w-2xl">
                After becoming victims of a robbery at the property we were renting, our lives were turned upside down. We felt vulnerable, frustrated, and shocked by how difficult it was to access reliable information about the places we live in. Important details about neighbourhoods, safety concerns, local incidents, community issues, and rental experiences were scattered across dozens of websites, social media groups, forums, and disconnected channels. Finding the truth required hours of research, and even then, it was difficult to know what information could be trusted.
              </Body>
            </div>
            <div className="rounded-[36px] overflow-hidden shadow-[0_24px_60px_rgba(20,22,33,0.08)] bg-white">
              <img
                src={sceneImage1}
                alt="Scene outside home"
                className="w-full h-[360px] object-cover"
              />
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-center">
            <div className="rounded-[36px] overflow-hidden shadow-[0_24px_60px_rgba(20,22,33,0.08)] bg-white">
              <img
                src={localImage}
                alt="Neighbourhood overview"
                className="w-full h-[360px] object-cover"
              />
            </div>
            <div className="space-y-6">
              <Body className="text-[#0B0B0B] leading-8 text-lg max-w-2xl">
                Following the incident, we made the difficult decision to move to a different home. But as we settled into our new place, a thought kept coming back to us: the property we had left behind would soon be rented to someone else. New tenants would likely move in without knowing that a serious robbery had taken place there only a few months earlier. There was no simple way for them to access that information, learn from previous tenants' experiences, or understand the reality of the area they were moving into.
              </Body>
              <Body className="font-semibold text-[#1A2B3C] leading-8 text-lg max-w-2xl">
                That was the moment we realised the rental market needed to change.
              </Body>
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
            <div className="space-y-6">
              <Body className="text-[#0B0B0B] leading-8 text-lg max-w-2xl">
                At the same time, we saw how disconnected many communities had become. Neighbours often didn't know each other, valuable local knowledge was lost, and people were left to make important decisions without access to clear, reliable information. Critical information that could help people choose a home, understand a neighbourhood, or avoid potential problems was hidden across countless platforms and conversations.
              </Body>
              <Body className="text-[#8B0202] font-semibold leading-8 text-lg max-w-2xl">
                We created RoomReview to change that.
              </Body>
            </div>
            <div className="rounded-[36px] overflow-hidden shadow-[0_24px_60px_rgba(20,22,33,0.08)] bg-white">
              <img
                src={neighbourhoodImage}
                alt="Connected community"
                className="w-full h-[360px] object-cover"
              />
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
            <div className="rounded-[36px] overflow-hidden shadow-[0_24px_60px_rgba(20,22,33,0.08)] bg-white">
              <img
                src={communityImage}
                alt="People connected across neighbourhoods"
                className="w-full h-[360px] object-cover"
              />
            </div>
            <div className="space-y-6">
              <Body className="text-[#0B0B0B] leading-8 text-lg max-w-2xl">
                Our goal is to bring people, communities, and local knowledge together in one place. We believe that everyone deserves access to honest information about where they live, rent, invest, or plan to move. By combining community experiences, verified reviews, local insights, and structured data, RoomReview helps people make smarter decisions while strengthening the connection between neighbours and communities.
              </Body>
              <Body className="text-[#8B0202] font-semibold leading-8 text-lg max-w-2xl">
                What started as a response to a personal challenge has grown into a mission to transform transparency in the rental market and create a more informed, connected, and empowered future for everyone.
              </Body>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <H3 className="text-[#1A2B3C] mb-6">Our mission</H3>
          <Body className="text-[#0B0B0B] leading-8 text-lg max-w-4xl">
            Making local information accessible, structured and actionable.
          </Body>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {[
              {
                title: 'Accessible',
                copy: 'Bringing together information that is often scattered across multiple sources.',
                icon: AccessibleIcon,
              },
              {
                title: 'Structured',
                copy: 'Transforming fragmented data into clear, easy-to-understand insights.',
                icon: StructuredIcon,
              },
              {
                title: 'Actionable',
                copy: 'Helping people make confident property decisions based on trusted information.',
                icon: ActionableIcon,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[32px] bg-white p-10 shadow-[0_16px_32px_rgba(15,23,42,0.06)] min-h-[440px] flex flex-col items-center text-center"
              >
                <div className="flex items-center justify-center rounded-[20px] bg-white h-24 w-24 mb-6">
                  <img src={item.icon} alt={`${item.title} icon`} className="h-12 w-12 object-contain" />
                </div>
                <p className="text-lg font-semibold text-[#1A2B3C] mb-4">{item.title}</p>
                <Body className="text-[#4A4A4A] leading-7">{item.copy}</Body>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <H2 className="text-[#1A2B3C] font-bold text-4xl tracking-[-0.02em]">
              Our trusted Data
            </H2>
            <Body className="mt-4 text-[#4A4A4A] text-lg max-w-2xl leading-8">
              RoomReview combines trusted UK data sources to provide clear, reliable insights into properties, postcodes, and neighborhoods.
            </Body>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="rounded-[32px] bg-[#E5E7EB] p-10 flex items-center justify-center h-44"
              >
                <span className="text-[#6B7280] font-semibold">Logo</span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-[#4A4A4A] max-w-3xl leading-7">
            *RoomReview uses publicly available data from government bodies, public authorities and other third-party sources. The inclusion of an organisation’s name or a link to its website is provided solely to identify the original source of the data and does not imply any endorsement, partnership, sponsorship or affiliation with RoomReview.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-12">
          <div>
            <H2 className="text-[#1A2B3C]">Contributors</H2>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] items-start">
            <div className="grid gap-6 md:grid-cols-2">
              {contributors.map((contributor) => (
                <div
                  key={contributor.name}
                  className="rounded-[36px] overflow-hidden border border-[#E5DCD5] bg-white shadow-sm"
                >
                  <img
                    src={contributor.image}
                    alt={contributor.name}
                    className="w-full h-[360px] object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xl font-semibold text-[#1A2B3C]">{contributor.name}</p>
                        <p className="mt-2 text-sm text-[#4A4A4A]">{contributor.role}</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-[#1A2B3C]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="rounded-[28px] overflow-hidden border border-[#E5DCD5] bg-white shadow-sm"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-[220px] object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-base font-semibold text-[#1A2B3C]">{member.name}</p>
                      <ExternalLink className="w-4 h-4 text-[#1A2B3C]" />
                    </div>
                    <p className="mt-2 text-sm text-[#4A4A4A]">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid gap-10 lg:grid-cols-[0.35fr_0.65fr] items-start">
          <div>
            <H2 className="text-[#1A2B3C]">Frequently Asked Questions</H2>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={item.question}
                  className="rounded-[28px] border border-[#E5DCD5] bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <div>
                      <p className="font-semibold text-[#1A2B3C]">{item.question}</p>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-[#8B0202] transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-[#4A4A4A] leading-7">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
